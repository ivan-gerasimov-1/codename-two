import { useState } from "react";
import { TimerReset } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function App() {
  const [task, setTask] = useState("");

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,oklch(0.98_0.01_254)_0%,oklch(0.99_0.005_254)_42%,oklch(0.95_0.01_254)_100%)] px-6 py-8 text-foreground">
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col justify-between gap-8 rounded-[1.25rem] border border-border bg-background p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] sm:p-8">
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Local time tracker
            </p>
            <h1 className="text-2xl font-semibold tracking-tight">Task shell</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground">
            <TimerReset className="h-5 w-5" aria-hidden="true" />
          </div>
        </header>

        <div className="flex flex-1 items-center">
          <div className="w-full space-y-4">
            <label htmlFor="task" className="text-sm font-medium text-foreground">
              Task
            </label>
            <Input
              id="task"
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="What are you tracking?"
              autoComplete="off"
              spellCheck={false}
              className="h-14 rounded-xl text-base"
            />
          </div>
        </div>

        <footer className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Local-only shell. No timer yet.
          </p>
          <Button type="button" size="lg" className="min-w-28 px-6">
            Start
          </Button>
        </footer>
      </section>
    </main>
  );
}
