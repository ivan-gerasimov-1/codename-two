import { useEffect, useMemo, useState } from "react";
import { TimerReset } from "lucide-react";

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

function getElapsedForTask(
  snapshot: TrackingSnapshot,
  task: string,
  now: number,
) {
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
      if (!snapshot.activeTask) {
        window.localStorage.removeItem(STORAGE_KEY);
        return;
      }

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          version: 1,
          updatedAt: Date.now(),
          ...snapshot,
        } satisfies TrackingRecord),
      );
      setPersistenceError("");
    } catch {
      setPersistenceError("Local persistence failed. Tracking is still active, but saved state may be stale.");
    }
  }

  function handleStart() {
    const normalizedTask = task.trim();

    if (!isValidTaskNumber(normalizedTask)) {
      setValidationError("Enter valid task number before starting.");
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
      activeTask: normalizedTask,
      sessionStartedAt: timestamp,
      elapsedByTask: {
        ...checkpoint.elapsedByTask,
        [normalizedTask]: checkpoint.elapsedByTask[normalizedTask] ?? 0,
      },
    };

    setTask(normalizedTask);
    setValidationError("");
    setActiveTask(nextSnapshot.activeTask);
    setSessionStartedAt(nextSnapshot.sessionStartedAt);
    setElapsedByTask(nextSnapshot.elapsedByTask);
    setNow(timestamp);
    persistSnapshot(nextSnapshot);
  }

  const activeTaskElapsed = formatElapsedTime(activeElapsedMilliseconds);
  const activeTaskLabel = activeTask ?? "No active task";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,oklch(0.98_0.01_254)_0%,oklch(0.99_0.005_254)_42%,oklch(0.95_0.01_254)_100%)] px-6 py-8 text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col gap-8 rounded-[1.25rem] border border-border bg-background p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] sm:p-8">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Local time tracker
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Active task tracking</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
            <TimerReset className="h-5 w-5" aria-hidden="true" />
          </div>
        </header>

        <div className="grid flex-1 gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-start">
          <div className="space-y-4">
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
              className="h-14 rounded-xl text-base"
            />
            {validationError ? (
              <p className="text-sm text-destructive" role="alert">
                {validationError}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Digits only. Start resumes same task from stored local time.
              </p>
            )}
          </div>

          <div className="rounded-[1rem] border border-border bg-secondary/30 p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Active session
            </p>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Task</p>
                <p className="text-2xl font-semibold tracking-tight">{activeTaskLabel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Elapsed</p>
                <p className="font-mono text-4xl font-semibold tracking-tight">{activeTaskElapsed}</p>
              </div>
            </div>
          </div>
        </div>

        <footer className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Local-only tracking. Saves checkpoint every minute.
          </p>
          <Button type="button" size="lg" className="min-w-28 px-6" onClick={handleStart}>
            Start
          </Button>
        </footer>

        {persistenceError ? (
          <p
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
            aria-live="polite"
          >
            {persistenceError}
          </p>
        ) : null}
      </section>
    </main>
  );
}
