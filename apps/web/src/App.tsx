import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_36%),linear-gradient(180deg,var(--color-slate-50),white_42%,var(--color-stone-100))] px-6 py-10 text-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <section className="grid gap-6 rounded-[2rem] border border-border/60 bg-background/90 p-8 shadow-[0_30px_120px_-48px_rgba(15,23,42,0.45)] backdrop-blur md:grid-cols-[1.6fr_1fr] md:p-12">
          <div className="space-y-6">
            <span className="inline-flex w-fit items-center rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Tailwind CSS v4 + shadcn v4
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
                Codename Two
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Opinionated React + Vite starter for codename-two with a
                polished Tailwind v4 pipeline and a complete shadcn v4 UI
                foundation you can extend instead of rebuilding.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button>Launch product work</Button>
              <Button variant="outline">Inspect starter tokens</Button>
            </div>
          </div>
          <div className="rounded-[1.5rem] border border-border/70 bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-foreground">
              Baseline included
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="rounded-2xl bg-secondary px-4 py-3">
                `src/main.css` with Tailwind v4 theme tokens
              </li>
              <li className="rounded-2xl bg-secondary px-4 py-3">
                `components.json` with full shadcn v4 configuration
              </li>
              <li className="rounded-2xl bg-secondary px-4 py-3">
                `cn()` helper and starter UI components (Button, Input,
                Textarea, Dialog, Dropdown Menu)
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
