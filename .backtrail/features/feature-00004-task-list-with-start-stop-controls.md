# FEATURE-00004: Task List With Start/Stop Controls

| Status   | Date       |
| -------- | ---------- |
| Implemented | 2026-05-10 |

## Context

The app can track one task at a time from a task number input, persist active elapsed time locally, and stop the active session on demand. Users now need a visible list of locally tracked tasks so they can see saved tasks and start or stop work from the list instead of manually re-entering task numbers.

This capability should keep the app local-only and build on the existing task elapsed-time storage. It should not introduce backend sync, accounts, or task metadata beyond what is needed to display and control locally tracked tasks.

## Goal

Show locally tracked tasks in a list, with per-task controls that let the user start tracking a task or stop the currently active task.

## Users / Use Cases

- Local user: see tasks that have tracked time saved locally.
- Local user: start tracking an existing task from the task list without retyping the task number.
- Local user: identify which task is currently active from the list.
- Local user: stop active tracking from the task row for the active task.
- Local user: continue using the existing task input and global start/stop flow.

## Scope

- Display a list of tasks from locally stored tracked-time records.
- Each task row shows the task number.
- Each task row shows elapsed time for that task, including live elapsed time for the active task.
- Each inactive task row provides a `Start` button that starts or resumes tracking for that task.
- The active task row provides a `Stop` button that saves elapsed time immediately and ends the active session.
- Starting a task from the list preserves existing behavior: only one active task at a time, existing active progress is checkpointed before switching, and tracking remains local-only.
- The list updates after start, stop, restore, and minute-level checkpoint saves.
- Empty state explains that tasks appear after tracking starts.

## Non-Goals

- No backend persistence, auth, sync, accounts, or cross-device task list.
- No task names, descriptions, editing, deletion, reordering, filtering, search, reports, charts, export, billing, or integrations.
- No multi-task concurrent tracking.
- No new storage architecture beyond what is needed to render existing locally tracked task records.
- No automatic task discovery outside local tracked-time data.

## Acceptance Criteria

- Given one or more tasks have saved local elapsed time, when the app renders, then it shows those tasks in a list.
- Given no tasks have saved local elapsed time and no active task exists, when the app renders, then it shows a clear empty state for the task list.
- Given a task row is inactive, when the user clicks that row's `Start` button, then tracking starts or resumes for that task.
- Given another task is active, when the user starts an inactive task from the list, then the previous active task is checkpointed locally before the new task becomes active.
- Given a task row is active, when the user views the row, then the row visibly indicates active state and displays live elapsed time.
- Given a task row is active, when the user clicks that row's `Stop` button, then current elapsed time is saved immediately and active tracking ends.
- Given local storage write fails during a row start or row stop action, then the app reports the persistence failure instead of implying the state was saved.
- Given implementation is reviewed, then the feature remains local-only and does not add backend, auth, sync, or unrelated reporting behavior.

## Dependencies

- FEATURE-00002: Active Local Time Tracking
- FEATURE-00003: Stop Active Local Time Tracking
- Browser `localStorage` availability for restoring and saving task elapsed records.

## Risks / Rollback

Task list accuracy depends on valid local tracking records. Invalid or unavailable local storage should preserve existing persistence-error messaging and avoid showing misleading saved state.

Switching tasks from row controls risks losing active progress if checkpoint persistence fails. Implementation should checkpoint before switching and surface failures.

Rollback is reversible: remove the task list UI and row-level controls while preserving existing input-based start/stop behavior and local tracking data.

## Related Features / ADRs

- FEATURE-00002: Active Local Time Tracking
- FEATURE-00003: Stop Active Local Time Tracking
