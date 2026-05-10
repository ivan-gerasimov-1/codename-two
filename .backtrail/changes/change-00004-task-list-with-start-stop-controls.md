# CHANGE-00004: Task List With Start/Stop Controls

| Status   | Date       | ADRs | Blocked By | Blocks |
| -------- | ---------- | ---- | ---------- | ------ |
| Done | 2026-05-10 | -    | -          | -      |

## Goal

Implement FEATURE-00004 by showing locally tracked tasks in a list with row-level start/stop controls and active elapsed-time display.

## Scope

Includes:

- Render a task list from locally stored tracked-time records.
- Show task number and elapsed time for each listed task.
- Show live elapsed time and active state for the currently active task.
- Add row-level `Start` controls for inactive tasks.
- Add row-level `Stop` control for the active task.
- Preserve one-active-task behavior, including checkpointing current progress before switching tasks.
- Show an empty state when no local task records or active task exist.
- Reuse existing local persistence and persistence-error reporting.

Excludes:

- Backend sync, auth, accounts, cross-device state, or integrations.
- Task names, descriptions, editing, deletion, reordering, filtering, search, reports, charts, export, or billing.
- New storage architecture beyond deriving the list from existing local tracked-time records.

## Implementation

1. Derive task list data from existing local tracked-time storage and current active-session state.
2. Render task rows with task number, elapsed time, and clear active/inactive state.
3. Wire inactive row `Start` actions into the existing start/switch tracking flow so active progress is checkpointed before a new task starts.
4. Wire active row `Stop` action into the existing stop flow so elapsed time is saved immediately before ending the session.
5. Refresh list state after start, stop, restore, and checkpoint persistence updates.
6. Preserve existing persistence-failure behavior for row start/stop failures.

## Verification

Run:

```bash
npm run test
```

Expected result:

- Existing tracking tests pass.
- Task list renders saved tasks and empty state correctly.
- Row `Start` starts or switches active tracking while preserving checkpoint behavior.
- Row `Stop` saves elapsed time and clears active tracking.
- Persistence failures are surfaced instead of implying saved state.
- No backend, auth, sync, or unrelated reporting behavior is added.

## Rollback

Remove the task list UI and row-level controls while preserving existing input-based start/stop behavior and local tracking data. Revert any task-list-specific tests with the UI changes.
