# CHANGE-00001: Installable Local Time Tracker Shell

| Status | Date       | ADRs | Blocked By | Blocks |
| ------ | ---------- | ---- | ---------- | ------ |
| Done   | 2026-05-09 | -    | -          | -      |

## Goal

Implement [FEATURE-00001](../features/feature-00001-installable-local-time-tracker-shell.md) as an installable local PWA that opens to one task input and one inert `Start` button.

## Scope

Included:

- Replace the existing starter landing content in `apps/web` with the local time-tracker shell.
- Add app metadata and production assets needed for Chrome PWA installability, including manifest, icons, start URL, display mode, theme color, and background color.
- Add conservative service-worker or equivalent installability wiring for the production build.
- Keep implementation inside existing `apps/web` structure, scripts, dependencies, and component conventions.

Excluded:

- Active timer behavior.
- Task persistence or history.
- Pause, stop, edit, delete, export, auth, sync, backend, push notifications, or background tracking.
- Replacement scaffold, parallel app, or unrelated restructuring.

## Implementation

1. Update `apps/web` UI to show a single task text input and one `Start` button.
2. Keep `Start` click handling inert: no timer, persistence, state mutation, or task behavior.
3. Add web app manifest metadata and link it from `apps/web/index.html`.
4. Add required PWA icon assets and browser metadata using local static assets.
5. Register minimal production-only service-worker behavior that supports Chrome installability while avoiding aggressive caching.
6. Preserve existing Vite, React, Tailwind, and component conventions.

## Verification

Run:

```bash
npm run build
```

Expected result:

- `apps/web` production build completes with no PWA asset, manifest, or service-worker errors.
- Built app renders one task input and one `Start` button.
- Clicking `Start` causes no timer or task behavior.
- When the production build is served over localhost or HTTPS, Chrome identifies the app as installable.
- Installed Chrome app launches to the same task input and `Start` button screen.

## Rollback

Remove manifest links, service-worker registration, service-worker file, and PWA icon assets. If installability wiring is the issue, keep the simple task input and `Start` shell so the product screen can continue independently.
