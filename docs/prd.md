# Two-Do — Product Requirements Document

**Author:** Vignesh (Kaar Tech UK)
**Status:** Shipped (v0.1, assessment prototype)
**Last updated:** 2026-04-14

---

## 1. Why this exists

### The moment of pain

*Sarah runs a weekly planning session. She has thirty tickets on screen, nested three levels deep: an epic contains stories, stories contain tasks. She realises the epic is misframed, deletes it, and watches twenty minutes of prep disappear — every child ticket gone with the parent. She reaches for Ctrl+Z but she's clicked three other things since. Her undo stack can't get her back without also reversing the good edits.*

Every project tool eventually asks its users this question: **"What do you mean by undo?"** Most answer with a stack — fine for the last keystroke, bad for anything older. And most answer the cascade question wrong: when a parent goes, so do its children. Both defaults punish the user for exploring.

### The fix we're testing

Two-Do separates three things that are usually conflated:

1. **Time travel** from **undo stacks**. History is a *timeline*; the slider is the primary navigation. Undo is just "pointer minus one."
2. **Reference** from **ownership** in the parent-child relationship. A child task points at a parent; the parent doesn't own the child. If the parent goes away, the child loses its pointer (becomes top-level), but it doesn't lose itself.
3. **User intent** from **UI convenience**. Checking a task off is a "mark done" intent — and unchecking should put it back where it was, not always reset to "todo."

This PRD locks in the minimum product that proves those three choices.

---

## 2. Audience

### Primary: the assessor

The evaluator is scoring state modelling, edge-case reasoning, and AI-assisted velocity. They will poke at the reconciliation logic and scrub the slider aggressively. They should be able to read the reducer and understand the design in under five minutes.

### Secondary: a future collaborator

A teammate picking this up to extend (drag-and-drop, due dates, persistence). They should find the model obvious, the components shallow, and the tests gaps marked honestly.

### Not in the audience (yet)

End users with sensitive data, teams collaborating in real-time, or anyone who cares about persistence across sessions.

---

## 3. Goals & non-goals

### Goals

| # | Goal | Measure |
|---|---|---|
| G1 | Prove the detach-on-orphan strategy works under undo, redo, and slider scrubbing | Manual walkthrough: every golden-path scenario in §8 passes |
| G2 | Single-reducer state model readable in one pass | `src/lib/reducer.ts` < 150 LOC with comments |
| G3 | UI that edits feel fast and forgiving | Inline title/description edit, Esc-cancels, no accidental data loss |
| G4 | Deployable to Vercel with no config | `vercel --prod` works from the project folder on a fresh clone |

### Non-goals

- No persistence (no localStorage, no IndexedDB, no DB).
- No authentication or user accounts.
- No real-time collaboration.
- No drag-and-drop (deferred — will be a follow-up gate).
- No notifications, no AI assistant, no search/filter.
- No mobile app. Responsive web only.

---

## 4. User stories

### US-1 — Create a subtask

> As a sprint lead, I want to attach a sub-task to an existing epic so that I can break work down without losing the parent context.

**Acceptance:** When I click `+` on any task, a form opens with that task pre-selected as parent. On submit, the new task renders indented under its parent.

### US-2 — Edit a title without a modal

> As a task author, I want to rename a task without opening a dialog so that quick corrections don't break my flow.

**Acceptance:** Clicking the title swaps it for an input focused and selected. Enter saves. Esc reverts. Blur saves. Empty input reverts (treated as cancel).

### US-3 — Uncheck a task without losing its status

> As a user who marked an in-progress task done by mistake, I want unchecking to restore my earlier status — not dump me at "todo".

**Acceptance:** Checking sets status to `done` and remembers the prior status in `previousStatus`. Unchecking sets status back to `previousStatus` (or `todo` if nothing stored) and clears `previousStatus`.

### US-4 — Delete a parent without losing the children

> As a planner who decides an epic was the wrong frame, I want to delete just that epic. The tasks I wrote under it should survive.

**Acceptance:** Deleting task A, which has children, removes A from the list; its direct children become top-level (`parentId = null`). No child is deleted. Grandchildren stay attached to the (now top-level) middle parent.

### US-5 — Undo all the way back

> As a user who's gone down the wrong path for five minutes, I want to scrub back to any earlier state and either keep exploring from there or return to the latest.

**Acceptance:** The slider at the bottom maps to every snapshot in the timeline. Scrubbing restores that exact state. Undo/redo buttons and Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z do the same. Acting while scrubbed truncates the future.

### US-6 — Move a task to a different parent

> As an organiser mid-reshuffle, I want to move a task under a different parent without recreating it.

**Acceptance:** Clicking the Move icon opens a dialog with a parent dropdown. The task itself and its descendants are excluded from the list (no cycles possible). Submit updates `parentId`; the task re-nests.

---

## 5. Scope — what ships in v0.1

| Capability | Built | Notes |
|---|---|---|
| Create top-level task | ✅ | "Add task" button in header |
| Create subtask (pre-selected parent) | ✅ | `+` on any card |
| Inline title edit | ✅ | Enter/blur save, Esc cancel |
| Inline description edit | ✅ | Blur / Cmd+Enter save, Esc cancel |
| Mark done (checkbox) | ✅ | Restores previous status on uncheck |
| Cycle through all 3 statuses | ✅ | `⋯` menu |
| Delete task | ✅ | Children detach |
| Move task to new parent | ✅ | Cycle prevention |
| Undo / redo | ✅ | Buttons + Cmd/Ctrl+Z shortcuts |
| Scrub slider | ✅ | Full timeline |
| Seed data | ✅ | 4 seed tasks (1 parent + 2 children + 1 standalone) |
| Empty state | ✅ | Icon + guidance text |
| Status colors | ✅ | Left accent stripe + colored badge (slate / blue / emerald) |
| Relative timestamps | ✅ | "Created 2h ago" on each card |

---

## 6. Non-functional requirements

- **Performance.** 100 snapshots in the timeline, < 16 ms per slider-scrub render.
- **Correctness invariant.** After every reducer action, `∀ task: task.parentId === null ∨ tasks[task.parentId] !== undefined`.
- **Type safety.** TypeScript strict mode, zero `any`, zero `@ts-ignore`.
- **Build.** `next build` succeeds with no errors or warnings that would block Vercel.
- **Accessibility.** All interactive elements keyboard-reachable. Dialog closes on Esc.

---

## 7. Assumptions & constraints

- 90-minute live-coding assessment time box means we trade breadth for correctness in the state model.
- The evaluator will run `npm run dev` locally **or** visit the live URL — we support both.
- AI assistance (Claude Code) is explicitly encouraged; the builder is evaluated on *how* they direct it, not whether.
- Windows is the primary dev environment; commands work with Git Bash / MSYS.

---

## 8. Success criteria / golden paths

Every item must pass manually in the live app before calling a build shippable:

1. Load app → seed tasks render (1 parent with 2 children + 1 standalone).
2. Add a top-level task → appears at the top level; step counter advances.
3. Add a subtask via `+` → renders indented under chosen parent.
4. Click title → inline input; Enter saves; new history step.
5. Click checkbox on a todo task → becomes done, badge + strikethrough + emerald accent.
6. Uncheck → status returns to `todo`. Repeat on an in-progress task → unchecking returns to `in-progress`.
7. Delete a parent with 2 children → parent gone, children unnested (no indent, no "Subtask of" label).
8. Undo → parent restored, children re-nested.
9. Redo → back to detached state.
10. Scrub slider to step 1 → only seed tasks, no user edits.
11. Scrub to latest → all edits back.
12. Scrub to mid-history then add a task → future truncated, step counter resets.
13. Move a task via Move dialog → new parent applied; descendants excluded from options (confirm by trying to pick own child).
14. Cmd/Ctrl+Z outside a text field → undo. Cmd/Ctrl+Shift+Z → redo. Inside a text field, native undo works.
15. Browser console during all above → no errors, no React hydration warnings.

---

## 9. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Reconciliation skipped on an action path | High | Single `commit()` helper that reconciles before appending. No reducer branch writes directly to `timeline`. |
| Hydration mismatch on timestamps | Low | `suppressHydrationWarning` scoped to the "Created X ago" span. |
| Base-ui Menu trigger quirks | Medium | Put the icon in `children`, not inside the `render` element, so events route correctly. |
| Assessor expects CRDT / real-time | — | Explicitly non-goal; stated in §3 and §5. |
| Seed tasks have identical `createdAt` on cold load | Low | Seeds use `base + n` offsets so ordering is stable. |

---

## 10. Rollout

v0.1 is deployed to Vercel production (https://task-manager-eosin-sigma-40.vercel.app). No rollback plan needed — no users, no data, no persistence. The `main` branch is the single source of truth; `vercel --prod` promotes it.

---

## 11. Open questions for the backlog

Captured from live feedback; none are shipping in v0.1.

- Drag-and-drop reordering (next gate).
- Should scrubbing the slider create a "fork" rather than truncate? Currently truncates (standard redo behavior).
- Color-coding tasks beyond status (per-task user color).
- Keyboard shortcut for "mark done" without losing focus?
- Persistence layer — if we add one, should the timeline be capped?
