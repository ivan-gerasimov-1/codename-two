# FEATURE-00002: Active Local Time Tracking

| Status   | Date       |
| -------- | ---------- |
| Implemented | 2026-05-09 |

## Context

The app currently provides an installable local time tracker shell with a task input and a `Start` button that has no timer behavior. The next product increment should turn this shell into real local task tracking while preserving the local-only model.

Users need confidence that tracked time is not lost if the page reloads, the browser closes, or the app is interrupted during an active task. The first tracking behavior should stay narrow: validate task entry, start tracking, show elapsed time for the current task, and persist progress locally at minute-level intervals.

## Goal

Provide real local time tracking from the `Start` button, with required task number validation, visible elapsed time, and minute-level `localStorage` persistence for active work.

## Users / Use Cases

- Local user: enter a task number, press `Start`, and see elapsed time begin for that task.
- Local user: return to a previously tracked task and continue from already accumulated local time.
- Local user: reload or reopen the app during active tracking and avoid losing more than the most recent unsaved minute.
- Developer: implement tracking without adding accounts, backend services, sync, or irreversible data changes.

## Scope

- `Start` validates that a task number is present before tracking begins.
- Validation prevents starting when the task number is empty or invalid according to the app's task input rules.
- Starting a task creates or resumes a local tracking session for that task number.
- The app displays elapsed time for the current task while tracking is active.
- If a task has multiple runs at different times, elapsed time continues from the task's existing locally stored accumulated duration.
- While tracking is active, the app persists a tracking record to `localStorage` at least once per minute.
- Persisted local data is sufficient to restore the active task and accumulated elapsed time after reload or app restart.
- Persistence behavior remains local-only and does not require auth, network access, backend storage, or cross-device sync.

## Non-Goals

- No backend persistence, cloud sync, account model, or cross-device merge behavior.
- No task history screen, reports, charts, export, billing, or integrations.
- No edit/delete workflow for saved task records.
- No pause, stop, switch-task, idle detection, or background notification workflow unless added by a later feature.
- No durable architectural decision about storage schema beyond the local behavior needed for this feature.

## Acceptance Criteria

- Given the task input is empty, when the user clicks `Start`, then tracking does not start and the app shows a clear validation message.
- Given a task number is entered, when the user clicks `Start`, then tracking starts for that task number.
- Given tracking is active, when time passes, then the app displays elapsed time for the current task.
- Given a task has locally stored elapsed time from earlier runs, when the user starts tracking that same task again, then displayed elapsed time continues from the stored total instead of starting at zero.
- Given tracking is active for at least one minute, when a minute boundary is reached, then the app writes the current tracking record to `localStorage`.
- Given the app reloads after a minute-level save, when the app opens again, then the active task and elapsed time are restored from `localStorage`.
- Given tracking is active and the app is interrupted before the next minute save, when the app reopens, then previously saved elapsed time remains intact and unsaved sub-minute progress may be lost.
- Given `localStorage` is unavailable or a write fails, when the app attempts to save progress, then tracking UI reports that local persistence failed instead of silently implying data is safe.
- Given implementation is reviewed, when persistence behavior is inspected, then no backend, auth, sync, or unrelated app restructuring is introduced.

## Dependencies

- FEATURE-00001 provides the installable local time tracker shell, task input, and `Start` button baseline.
- Browser `localStorage` availability is required for persistence.
- Timer accuracy depends on browser scheduling; background tabs or installed app suspension may delay UI updates and save callbacks.

## Risks / Rollback

`localStorage` can be unavailable, full, manually cleared, or blocked by browser settings. Implementation should detect write failures and make loss risk visible to the user.

Browser timer throttling can delay minute-level callbacks in background contexts. The implementation should derive elapsed time from timestamps rather than trusting interval tick counts.

Rollback is reversible: disable tracking behavior and ignore or remove the local tracking keys while preserving the shell from FEATURE-00001. Stored local data should use scoped keys so cleanup does not affect unrelated browser storage.

## Related Features / ADRs

- FEATURE-00001: Installable Local Time Tracker Shell
