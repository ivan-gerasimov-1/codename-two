# FEATURE-00003: Stop Active Local Time Tracking

| Status   | Date       |
| -------- | ---------- |
| Implemented | 2026-05-09 |

## Context

Current local tracking can start a task and persist progress at minute-level intervals. Users need a way to end active tracking on demand and save current elapsed time immediately, instead of waiting for the next scheduled checkpoint.

This feature extends active local tracking with an explicit stop action while keeping storage local-only.

## Goal

Let user stop current active tracking session and persist current tracked time right away.

## Users / Use Cases

- Local user: stop current task when work ends and keep exact time already tracked.
- Local user: stop tracking before closing app and avoid waiting for minute checkpoint.
- Local user: reload app after stop and see saved elapsed time still available for same task.

## Scope

- Add stop action for current active tracking session.
- On stop, persist current tracked time immediately to local storage.
- Stop ends active session state for current task.
- Saved elapsed time remains available for later resume of same task.
- Behavior stays local-only and uses existing browser storage model.

## Non-Goals

- No backend sync, accounts, or cross-device state merge.
- No reports, exports, billing, or task history screen.
- No idle detection, auto-stop, or pause/resume timeline model beyond explicit stop.
- No redesign of storage architecture beyond what stop needs.

## Acceptance Criteria

- Given tracking is active, when user clicks `Stop`, then app saves current tracked time immediately.
- Given user clicks `Stop`, when save succeeds, then active session ends and UI no longer shows tracking as active.
- Given user stops tracking and reloads app, then saved elapsed time for task remains available locally.
- Given local storage write fails on stop, then app reports persistence failure instead of implying time was saved.
- Given implementation is reviewed, then feature remains local-only and does not add backend or sync behavior.

## Dependencies

- FEATURE-00002: Active Local Time Tracking
- Browser `localStorage` availability for immediate save

## Risks / Rollback

Local storage may be unavailable or full, so stop action must surface save failure.

Rollback is reversible: remove stop action and ignore stop-triggered persistence changes while preserving existing active tracking behavior from FEATURE-00002.

## Related Features / ADRs

- FEATURE-00002: Active Local Time Tracking
