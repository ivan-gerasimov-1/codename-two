import { useEffect, useMemo, useState } from "react";
import { Clock3, Play, Sparkles, Square, TimerReset, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TrackingSnapshot = {
  activeTask: string | null;
  sessionStartedAt: number | null;
  elapsedByTask: Record<string, number>;
};

type TrackingRecord = TrackingSnapshot & {
  version: 1;
  updatedAt: number;
};

type TaskRow = {
  task: string;
  elapsedMilliseconds: number;
  isActive: boolean;
};

const STORAGE_KEY = "codename-two:web:active-time-tracking:v1";

function isValidTaskNumber(value: string) {
  return /^\d+$/.test(value);
}

function formatElapsedTime(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

function parseElapsedByTask(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const result: Record<string, number> = {};

  for (const [task, elapsed] of Object.entries(value)) {
    if (!isValidTaskNumber(task) || typeof elapsed !== "number" || !Number.isFinite(elapsed) || elapsed < 0) {
      return null;
    }

    result[task] = Math.floor(elapsed);
  }

  return result;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function parseTrackingRecord(rawValue: string) {
  const parsed: unknown = JSON.parse(rawValue);

  if (!isRecord(parsed)) {
    return null;
  }

  if (parsed.version !== 1 || typeof parsed.updatedAt !== "number") {
    return null;
  }

  const activeTask = parsed.activeTask ?? null;
  const sessionStartedAt = parsed.sessionStartedAt ?? null;

  if (activeTask !== null && typeof activeTask !== "string") {
    return null;
  }

  if (activeTask !== null && !isValidTaskNumber(activeTask)) {
    return null;
  }

  if (sessionStartedAt !== null && typeof sessionStartedAt !== "number") {
    return null;
  }

  if ((activeTask === null) !== (sessionStartedAt === null)) {
    return null;
  }

  const elapsedByTask = parseElapsedByTask(parsed.elapsedByTask);
  if (!elapsedByTask) {
    return null;
  }

  return {
    activeTask,
    sessionStartedAt,
    elapsedByTask,
  } satisfies TrackingSnapshot;
}

function getElapsedForTask(snapshot: TrackingSnapshot, task: string, now: number) {
  const savedElapsed = snapshot.elapsedByTask[task] ?? 0;

  if (snapshot.activeTask === task && snapshot.sessionStartedAt !== null) {
    return savedElapsed + Math.max(0, now - snapshot.sessionStartedAt);
  }

  return savedElapsed;
}

function createCheckpoint(snapshot: TrackingSnapshot, now: number) {
  if (!snapshot.activeTask || snapshot.sessionStartedAt === null) {
    return snapshot;
  }

  const activeTask = snapshot.activeTask;
  const nextElapsedByTask = {
    ...snapshot.elapsedByTask,
    [activeTask]: getElapsedForTask(snapshot, activeTask, now),
  };

  return {
    activeTask,
    sessionStartedAt: now,
    elapsedByTask: nextElapsedByTask,
  } satisfies TrackingSnapshot;
}

function getTrackedTaskRows(snapshot: TrackingSnapshot, now: number) {
  const taskNumbers = new Set(Object.keys(snapshot.elapsedByTask));

  if (snapshot.activeTask) {
    taskNumbers.add(snapshot.activeTask);
  }

  return [...taskNumbers]
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }))
    .map((task) => {
      const isActive = snapshot.activeTask === task && snapshot.sessionStartedAt !== null;

      return {
        task,
        isActive,
        elapsedMilliseconds: isActive ? getElapsedForTask(snapshot, task, now) : snapshot.elapsedByTask[task] ?? 0,
      } satisfies TaskRow;
    });
}

export default function App() {
  const [task, setTask] = useState("");
  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [sessionStartedAt, setSessionStartedAt] = useState<number | null>(null);
  const [elapsedByTask, setElapsedByTask] = useState<Record<string, number>>({});
  const [validationError, setValidationError] = useState("");
  const [persistenceError, setPersistenceError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      if (!rawValue) {
        return;
      }

      const snapshot = parseTrackingRecord(rawValue);
      if (!snapshot) {
        setPersistenceError("Saved local tracking data was invalid and could not be restored.");
        return;
      }

      setTask(snapshot.activeTask ?? "");
      setActiveTask(snapshot.activeTask);
      setSessionStartedAt(snapshot.sessionStartedAt);
      setElapsedByTask(snapshot.elapsedByTask);
      setNow(Date.now());
    } catch {
      setPersistenceError("Local persistence is unavailable. Tracking cannot be restored or saved.");
    }
  }, []);

  const taskRows = useMemo(() => {
    return getTrackedTaskRows(
      {
        activeTask,
        sessionStartedAt,
        elapsedByTask,
      },
      now,
    );
  }, [activeTask, sessionStartedAt, elapsedByTask, now]);

  const activeElapsedMilliseconds = useMemo(() => {
    if (!activeTask) {
      return 0;
    }

    const snapshot: TrackingSnapshot = {
      activeTask,
      sessionStartedAt,
      elapsedByTask,
    };

    return getElapsedForTask(snapshot, activeTask, now);
  }, [activeTask, sessionStartedAt, elapsedByTask, now]);

  useEffect(() => {
    if (!activeTask || sessionStartedAt === null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [activeTask, sessionStartedAt]);

  useEffect(() => {
    if (!activeTask || sessionStartedAt === null) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const timestamp = Date.now();
      const checkpoint = createCheckpoint(
        {
          activeTask,
          sessionStartedAt,
          elapsedByTask,
        },
        timestamp,
      );

      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            version: 1,
            updatedAt: timestamp,
            ...checkpoint,
          } satisfies TrackingRecord),
        );
        setPersistenceError("");
        setElapsedByTask(checkpoint.elapsedByTask);
        setSessionStartedAt(checkpoint.sessionStartedAt);
        setNow(timestamp);
      } catch {
        setPersistenceError("Local persistence failed. Tracking is still active, but saved state may be stale.");
      }
    }, 60_000);

    return () => window.clearInterval(intervalId);
  }, [activeTask, sessionStartedAt, elapsedByTask]);

  function persistSnapshot(snapshot: TrackingSnapshot) {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          updatedAt: Date.now(),
          ...snapshot,
        } satisfies TrackingRecord),
      );
      setPersistenceError("");
      return true;
    } catch {
      setPersistenceError("Local persistence failed. Tracking state was not saved.");
      return false;
    }
  }

  function startTask(nextTask: string) {
    const timestamp = Date.now();
    const checkpoint = createCheckpoint(
      {
        activeTask,
        sessionStartedAt,
        elapsedByTask,
      },
      timestamp,
    );

    const nextSnapshot: TrackingSnapshot = {
      activeTask: nextTask,
      sessionStartedAt: timestamp,
      elapsedByTask: {
        ...checkpoint.elapsedByTask,
        [nextTask]: checkpoint.elapsedByTask[nextTask] ?? 0,
      },
    };

    setTask(nextTask);
    setValidationError("");
    setActiveTask(nextSnapshot.activeTask);
    setSessionStartedAt(nextSnapshot.sessionStartedAt);
    setElapsedByTask(nextSnapshot.elapsedByTask);
    setNow(timestamp);
    persistSnapshot(nextSnapshot);
  }

  function handleStart() {
    const normalizedTask = task.trim();

    if (!isValidTaskNumber(normalizedTask)) {
      setValidationError("Enter valid task number before starting.");
      return;
    }

    startTask(normalizedTask);
  }

  function handleRowStart(nextTask: string) {
    startTask(nextTask);
  }

  function handleStop() {
    if (!activeTask || sessionStartedAt === null) {
      return;
    }

    const timestamp = Date.now();
    const checkpoint = createCheckpoint(
      {
        activeTask,
        sessionStartedAt,
        elapsedByTask,
      },
      timestamp,
    );
    const nextSnapshot: TrackingSnapshot = {
      activeTask: null,
      sessionStartedAt: null,
      elapsedByTask: checkpoint.elapsedByTask,
    };

    if (!persistSnapshot(nextSnapshot)) {
      return;
    }

    setValidationError("");
    setActiveTask(null);
    setSessionStartedAt(null);
    setElapsedByTask(nextSnapshot.elapsedByTask);
    setNow(timestamp);
  }

  const activeTaskElapsed = formatElapsedTime(activeElapsedMilliseconds);
  const activeTaskLabel = activeTask ?? "No active task";
  const hasActiveSession = Boolean(activeTask && sessionStartedAt !== null);
  const taskCountLabel = taskRows.length === 1 ? "1 task tracked" : `${taskRows.length} tasks tracked`;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(247,198,101,0.18),transparent_28%),radial-gradient(circle_at_85%_15%,rgba(81,163,255,0.14),transparent_30%),linear-gradient(180deg,rgba(7,10,16,1)_0%,rgba(12,16,24,1)_55%,rgba(8,11,18,1)_100%)] px-4 py-4 text-foreground sm:px-6 sm:py-6 lg:px-8 lg:py-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_82%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.14),transparent_72%)] opacity-80"
      />

      <section className="relative mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/[0.045] p-4 shadow-[0_36px_120px_-52px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-6 lg:p-8">
        <header className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Local-only tracker
            </div>
            <div className="space-y-3">
              <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Quiet time, sharp control.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Track work in one place. No sync, no account, no hidden state. Clean UI, local storage, fast start/stop flow.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Tracked tasks</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{taskCountLabel}</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Session state</p>
              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${hasActiveSession ? "bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" : "bg-white/30"}`}
                />
                <p className="text-2xl font-semibold tracking-tight">{hasActiveSession ? "Running" : "Idle"}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.05] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Composer</p>
                <h2 className="font-display text-2xl font-semibold tracking-tight">Start next task</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Digits only
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <label htmlFor="task" className="text-sm font-medium text-foreground">
                  Task number
                </label>
                <Input
                  id="task"
                  value={task}
                  onChange={(event) => setTask(event.target.value)}
                  placeholder="Enter task number"
                  inputMode="numeric"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(validationError)}
                  className="h-14 rounded-2xl border-white/10 bg-white/[0.04] px-4 text-base text-foreground placeholder:text-muted-foreground/70 focus-visible:border-primary/40 focus-visible:ring-primary/30"
                />
              </div>

              {validationError ? (
                <div
                  className="flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
                  role="alert"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" aria-hidden="true" />
                  <p>{validationError}</p>
                </div>
              ) : (
                <p className="text-sm leading-6 text-muted-foreground">
                  Digits only. Start resumes same task from stored local time.
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  size="lg"
                  className="h-12 rounded-full border border-primary/35 bg-[linear-gradient(135deg,oklch(0.76_0.14_82),oklch(0.67_0.12_86))] px-5 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-22px_rgba(250,204,21,0.75)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_44px_-20px_rgba(250,204,21,0.82)]"
                  onClick={handleStart}
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                  Start task
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="destructive"
                  className="h-12 rounded-full border border-rose-400/20 bg-rose-500/10 px-5 text-sm font-semibold text-rose-100 shadow-none transition-transform hover:-translate-y-0.5 hover:bg-rose-500/15 disabled:opacity-40"
                  onClick={handleStop}
                  disabled={!hasActiveSession}
                >
                  <Square className="h-4 w-4" aria-hidden="true" />
                  Stop
                </Button>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.04)_100%)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Active session</p>
                <h2 className="font-display text-2xl font-semibold tracking-tight">Live clock</h2>
              </div>
              <div
                className={`rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] ${hasActiveSession ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-black/20 text-muted-foreground"}`}
              >
                {hasActiveSession ? "Running" : "Idle"}
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Current task</p>
                <p className="mt-3 font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  {activeTaskLabel}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                    <Clock3 className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                    Elapsed
                  </div>
                  <p className="mt-3 font-mono-ui text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl">
                    {activeTaskElapsed}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5">
                  <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Flow</p>
                  <p className="mt-3 text-lg font-semibold tracking-tight">Local only</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    State stays in browser storage. Stop seals elapsed time immediately.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">Tracked tasks</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Local task list</h2>
            </div>
            <p className="text-sm text-muted-foreground">{taskRows.length === 1 ? "1 task" : `${taskRows.length} tasks`}</p>
          </div>

          {taskRows.length > 0 ? (
            <div className="mt-5 grid gap-3">
              {taskRows.map((row) => (
                <article
                  key={row.task}
                  className={`rounded-[1.5rem] border p-4 transition-colors sm:p-5 ${row.isActive ? "border-emerald-400/25 bg-emerald-400/[0.08]" : "border-white/10 bg-black/15 hover:bg-white/[0.045]"}`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${row.isActive ? "bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.14)]" : "bg-white/30"}`}
                        />
                        <p className="font-display text-xl font-semibold tracking-tight text-balance">Task {row.task}</p>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.16em] ${row.isActive ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100" : "border-white/10 bg-black/20 text-muted-foreground"}`}
                        >
                          {row.isActive ? "Active" : "Saved"}
                        </span>
                      </div>
                      <p className="font-mono-ui text-3xl font-semibold tracking-tight text-primary-foreground">
                        {formatElapsedTime(row.elapsedMilliseconds)}
                      </p>
                    </div>

                    {row.isActive ? (
                      <Button
                        type="button"
                        size="lg"
                        variant="destructive"
                        className="h-11 rounded-full border border-rose-400/20 bg-rose-500/10 px-4 text-sm font-semibold text-rose-100 hover:bg-rose-500/15"
                        onClick={handleStop}
                      >
                        <Square className="h-4 w-4" aria-hidden="true" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        size="lg"
                        variant="outline"
                        className="h-11 rounded-full border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-foreground hover:bg-white/[0.08]"
                        onClick={() => handleRowStart(row.task)}
                      >
                        <Play className="h-4 w-4" aria-hidden="true" />
                        Start
                      </Button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/12 bg-black/15 px-5 py-10 text-center">
              <p className="font-display text-xl font-semibold tracking-tight">No tracked tasks yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Start one task and it appears here with saved elapsed time.
              </p>
            </div>
          )}
        </section>

        <footer className="flex flex-col gap-3 border-t border-white/10 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm leading-6 text-muted-foreground">
            {hasActiveSession
              ? "Local-only tracking. Stop saves elapsed time immediately."
              : "Local-only tracking idle. Start resumes from saved local time."}
          </p>
          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">No sync · No auth · No backend</p>
        </footer>

        {persistenceError ? (
          <p
            className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-50"
            role="status"
            aria-live="polite"
          >
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" aria-hidden="true" />
            {persistenceError}
          </p>
        ) : null}
      </section>
    </main>
  );
}
