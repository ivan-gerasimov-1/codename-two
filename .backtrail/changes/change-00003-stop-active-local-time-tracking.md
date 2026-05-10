# CHANGE-00003: Stop Active Local Time Tracking

| Status   | Date       | ADRs | Blocked By | Blocks |
| -------- | ---------- | ---- | ---------- | ------ |
| Done | 2026-05-09 | -    | -          | -      |

## Goal

Implement FEATURE-00003 by letting users stop the active local tracking session and persist elapsed time immediately.

## Scope

Includes a stop action for an active session, immediate local persistence of elapsed time, inactive UI state after successful stop, and visible persistence failure handling when stop save fails.

Excludes backend sync, task history, idle detection, reports, exports, and storage architecture redesign.

## Implementation

1. Add stop behavior that checkpoints current elapsed time for the active task at click time.
2. Persist the checkpointed elapsed time to local storage while clearing active session fields.
3. Update React state only after successful stop persistence so UI does not imply saved time when storage write fails.
4. Add a `Stop` control that is available only while tracking is active and keeps existing start/resume behavior intact.
5. Adjust copy/status messaging to reflect active versus stopped local tracking.

## Verification

Run:

```bash
npm run test
npm run build
```

Expected result:

- Active tracking can be stopped.
- Stop immediately saves elapsed time locally.
- UI no longer shows tracking as active after successful stop.
- Reload after stop restores saved elapsed time for same task.
- Simulated local storage failure reports an error and does not imply time was saved.

## Rollback

Remove the stop handler/control and restore the previous active-tracking persistence behavior. Existing elapsed task data remains compatible because storage shape is unchanged.

## Related

- FEATURE-00003: Stop Active Local Time Tracking
- FEATURE-00002: Active Local Time Tracking
