# CHANGE-00005: Improve Web Tracker UI

| Status   | Date       | ADRs | Blocked By | Blocks |
| -------- | ---------- | ---- | ---------- | ------ |
| Done     | 2026-05-10 | -    | -          | -      |

## Goal

Improve the current web time tracker interface using the `frontend-design` skill direction so the app feels polished, distinctive, and production-ready without changing tracking behavior.

## Scope

Includes:

- Refresh the visual design of the existing web tracker app.
- Improve layout, hierarchy, spacing, typography, color, and component states for the current task input, active tracking status, stop flow, and task list controls.
- Apply a cohesive, non-generic aesthetic direction suitable for a focused local time tracker.
- Preserve all existing local-only tracking behavior, persistence behavior, accessibility expectations, and user workflows.
- Keep changes within the current web app UI implementation and styling.

Excludes:

- New product capabilities beyond visual and interaction polish.
- Backend sync, auth, accounts, integrations, reporting, charts, export, billing, or cross-device state.
- Storage model changes or tracking algorithm changes.
- New durable architecture, repository structure, build/test workflow, or dependency decisions.

## Implementation

1. Review the current web app UI in `apps/web/src/App.tsx` and styling in `apps/web/src/main.css`.
2. Choose one clear `frontend-design` aesthetic direction and apply it consistently across the tracker shell, controls, active state, task list, empty state, and error messaging.
3. Refine typography, spacing, responsive layout, color tokens, focus/hover/disabled states, and visual hierarchy without altering tracking logic.
4. Add tasteful CSS-only atmosphere or motion where it improves clarity and does not hide state changes.
5. Preserve existing semantic controls and accessible labels while improving affordance and readability.

## Verification

Run:

```bash
npm run test
```

Expected result:

- Existing tracking behavior tests pass.
- Task start, stop, switch, restore, checkpoint, and persistence-error behavior remains unchanged.
- UI remains usable at common mobile and desktop widths.
- Focus states, button states, active task state, empty state, and error state are visible and readable.
- No backend, auth, sync, or unrelated reporting behavior is added.

## Rollback

Revert the UI and CSS changes for this change. Because tracking logic and local storage format should remain unchanged, rollback should not require data migration or cleanup.
