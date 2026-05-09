# FEATURE-00001: Installable Local Time Tracker Shell

| Status     | Date       |
| ---------- | ---------- |
| Implemented | 2026-05-09 |

## Context

We are building a Progressive Web Application for local time tracking by task. The first user-visible increment should use the pre-existing infrastructure in `apps/web`, prove that the current app can build, and make it installable from Chrome as an application.

This feature is intentionally small: one field for task entry and a `Start` button that has no behavior yet. The main product value is a working, installable PWA baseline that later time tracking features can extend.

## Goal

Provide an installable local PWA that opens to a single task input and a `Start` button.

## Users / Use Cases

- Local user: open the web app and see a minimal task time-tracking entry screen.
- Local user: install the app from Chrome and launch it as an app-like experience.
- Developer: build the app from `apps/web` and verify PWA installability in Chrome.

## Scope

- `apps/web` hosts the PWA application using its existing application structure, dependencies, build scripts, and component conventions.
- App opens to one text input for task entry.
- App shows one `Start` button.
- Pressing `Start` has no behavior in this feature.
- Production build includes required PWA assets/configuration for Chrome installability.
- Installed app should use app-like metadata, including name, icon, start URL, display mode, and theme/background colors.

## Non-Goals

- No active timer.
- No task persistence.
- No task history.
- No pause, stop, edit, delete, or export flows.
- No auth, accounts, sync, backend dependency, or personal data storage.
- No push notifications or background tracking.
- No replacement scaffold, parallel web app, or unrelated restructuring of `apps/web`.

## Acceptance Criteria

- Given the user opens `apps/web`, when the app loads, then a single task input is visible.
- Given the app is loaded, when the user views the primary action, then a `Start` button is visible.
- Given the user clicks `Start`, when the click is handled, then no task or timer behavior occurs.
- Given a production build is generated, when served over a Chrome-compatible secure context, then Chrome can identify the app as installable.
- Given the app is installed from Chrome, when launched, then it opens to the same input and `Start` button screen.
- Given the app is built locally, when the build command completes, then no PWA asset or manifest errors prevent shipping the shell.
- Given the implementation is reviewed, when `apps/web` changes are inspected, then the solution reuses current app infrastructure instead of replacing the existing app.

## Dependencies

- Existing `apps/web` build tooling, scripts, dependencies, and component conventions must remain the implementation baseline.
- PWA installability requires a web app manifest and service worker or equivalent browser-recognized install criteria.
- Chrome install verification requires serving the production build over localhost or HTTPS.

## Risks / Rollback

PWA caching can make local verification confusing if outdated assets remain installed. Implementation should keep caching conservative for the first shell and document any manual Chrome uninstall/cache reset needed during development.

Rollback is reversible: remove PWA registration/manifest wiring while leaving the basic web screen intact if installability causes build or runtime issues.
