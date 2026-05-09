# Codename Two

## Workspaces

- `apps/web` - React + Vite product app with Tailwind CSS v4 and shadcn-ready wiring
- `apps/site` - Astro marketing site
- `apps/api` - Node + Hono API
- `packages/` - reserved workspace container for future shared packages

## Getting started

Use Node.js 24 or newer before installing dependencies.

1. Install dependencies with `npm install`
2. Start the web app with `npm run dev --workspace @codename-two/web`
3. Start the site with `npm run dev --workspace @codename-two/site`
4. Start the API with `npm run dev --workspace @codename-two/api`

The generated web app already includes a Tailwind CSS v4 baseline, `@/*` aliases, and the starter wiring needed to begin adding shadcn/ui components.
