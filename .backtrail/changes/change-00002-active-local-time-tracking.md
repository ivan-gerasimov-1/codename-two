# CHANGE-00002: Active Local Time Tracking

| Status   | Date       | ADRs | Blocked By | Blocks |
| -------- | ---------- | ---- | ---------- | ------ |
| Done     | 2026-05-09 | -    | -          | -      |

## Goal

Implement [FEATURE-00002](../features/feature-00002-active-local-time-tracking.md) by turning the existing local time-tracker shell into active local task tracking with validation, elapsed-time display, and minute-level local persistence.

## Scope

Included:

- Validate the task input before tracking starts and show a clear inline error when the task number is missing or invalid.
- Start or resume local tracking for the entered task number from the existing `Start` button.
- Display elapsed time for the active task, deriving elapsed duration from timestamps rather than interval counts.
- Persist active tracking data to scoped `localStorage` keys at least once per minute while tracking is active.
- Restore the active task and last saved elapsed time after reload or app restart.
- Surface local persistence failures in the UI when `localStorage` is unavailable or writes fail.

Excluded:

- Backend persistence, auth, sync, account state, cross-device merge behavior, or network access.
- Task history, reports, charts, export, billing, integrations, edit/delete flows, pause/stop controls, idle detection, or background notifications.
- Broad app restructuring or a durable storage architecture decision beyond the local behavior required by the feature.

## Implementation

1. Add local tracker state for task number, active tracking metadata, elapsed duration, validation error, and persistence error.
2. Define a scoped `localStorage` record for the active task and accumulated task durations.
3. On `Start`, validate the trimmed task number, clear stale validation state, and create or resume the active local tracking session.
4. Use timestamp-based elapsed calculation so delayed browser timers do not corrupt tracked totals.
5. Update visible elapsed time while tracking is active.
6. Save the active tracking record to `localStorage` on minute-level intervals and restore it during app startup.
7. Catch read/write failures and show a persistence warning instead of silently implying saved state is safe.
8. Keep the implementation inside the existing `apps/web` React/Vite shell and current component conventions.

## Verification

Run:

```bash
npm run build
```

Expected result:

- Production build completes successfully.
- Empty or invalid task input does not start tracking and shows a clear validation message.
- Valid task input starts tracking from the existing `Start` button.
- Elapsed time is visible and increases while tracking is active.
- Starting a previously tracked task resumes from its stored local duration.
- Active tracking writes a scoped local record after a minute-level save boundary.
- Reload after a save restores active task and elapsed time from `localStorage`.
- Simulated `localStorage` failure shows a visible persistence warning.
- No backend, auth, sync, network persistence, or unrelated app restructuring is introduced.

## Rollback

Remove the tracker state, timer effects, `localStorage` read/write helpers, validation messaging, and persistence warning UI. Leave the FEATURE-00001 shell intact and ignore or delete only the scoped local tracking keys created by this change.
