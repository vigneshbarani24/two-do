# Two-Do — Collaborative Task Manager with Time Travel

> **Live:** https://task-manager-eosin-sigma-40.vercel.app
> **Repo:** https://github.com/vigneshbarani24/two-do
> **Status:** Working prototype — built for the AI Vibe Coding technical assessment.

---

## The problem

Sarah is a sprint lead. Twenty minutes into reshuffling a backlog, she deletes the wrong epic. In most task tools that deletion cascades — fourteen child tickets vanish with it, and her only recourse is to rebuild from memory. Undo stacks help when the last mistake was your last action, but not when you've kept clicking past it.

Teams need a task manager that treats history as a **timeline** rather than a stack, and treats parent-child dependencies as **references** rather than ownership. When the parent disappears, the children should stay.

## What Two-Do does

A client-side task manager where every action becomes a snapshot on a timeline. You can:

- **Scrub the slider** to any prior state — create, edit, delete, status change.
- **Undo / redo** linearly, or jump to any step.
- **Delete a parent** and the children stay (detached to top-level), never lost.

No backend. No database. All state lives in a single React reducer. The full history lives in memory and is built for the demo surface, not permanence.

## The live app

| Feature | How |
|---|---|
| Create top-level task | "Add task" button |
| Create subtask | `+` on any task card |
| Edit title | Click the title → Enter saves, Esc cancels |
| Edit description | Click the description (or "+ Add description") → blur or Cmd/Ctrl+Enter saves |
| Mark done | Checkbox. Uncheck restores the previous status (preserves "in-progress" intent). |
| Change status (all 3) | `⋯` menu on the card |
| Move to different parent | Move icon on the card → dialog with cycle prevention |
| Delete | Trash icon (children detach, don't delete) |
| Undo / redo | Bottom slider buttons, or **Cmd/Ctrl+Z** / **Cmd/Ctrl+Shift+Z** |
| Scrub history | Bottom slider |

## Architecture in one paragraph

A single `useReducer` owns `HistoryState = { past[], present, future[], timeline[], pointer }`. Every mutating action runs through a `commit()` helper that reconciles orphaned `parentId` references (sets them to `null`), truncates any redo-future, and appends the reconciled snapshot to `timeline[]`. Undo/redo/slider are pure pointer moves — the snapshots they reveal are already clean, because reconciliation happens on insert. This invariant is the core of the assessment.

```
Task { id, title, description, status, previousStatus?, parentId, createdAt }
  ↓
AppState { tasks: Record<id, Task> }
  ↓
HistoryState { past[], present, future[], timeline[], pointer }
```

## Stack

- **Next.js 16** (App Router, Turbopack) + **React 19** + **TypeScript (strict)**
- **Tailwind CSS 4** + **shadcn/ui** (base-ui primitives)
- **Vercel** for deployment
- **No** backend, DB, auth, localStorage, API routes

## Quick start

```bash
git clone https://github.com/vigneshbarani24/two-do.git
cd two-do/task-manager
npm install
npm run dev
# → http://localhost:3000
```

## Documentation

| File | Purpose |
|---|---|
| [`docs/prd.md`](docs/prd.md) | Product requirements — who, why, what ships |
| [`docs/manual.md`](docs/manual.md) | End-user guide with screenshots-worth-of-words |
| [`docs/design.md`](docs/design.md) | Technical design — component tree, data model, reducer flow |
| [`docs/requirements.md`](docs/requirements.md) | EARS-style acceptance criteria |
| [`docs/tasks.md`](docs/tasks.md) | Original 14-step build plan |
| [`assessment.md`](assessment.md) | Original assessment brief from the evaluator |
| [`CLAUDE.md`](CLAUDE.md) | AI-coding guide — project conventions for Claude Code |

## Build history (gates)

Each gate ended with a commit on `main`:

| Gate | What shipped | Commit prefix |
|---|---|---|
| G0 | Scaffold Next.js 16 + shadcn/ui, docs moved into `docs/` | `5aeb07e` |
| G1 | Core state: types, reducer with reconciliation, seed data | `981a929` |
| G2 | Presentational UI: form, item, tree, list | `b442487` |
| G3 | Orchestrator, slider, page wiring — end-to-end working | `1aa9c8b` |
| G3.5 | Inline edit, checkbox, move dialog, status colors, keyboard shortcuts, menu bug fix | `9a5a1d4` → `fbdc1f2` |

## Backlog (deliberately out of scope)

Captured from feedback during the build:

- **Drag-and-drop** reordering (next up)
- Due dates + overdue highlighting
- Priorities (P1–P4)
- Extended statuses (blocked, in-review)
- Tags / labels / colors per task
- Search + filter
- `localStorage` persistence
- Multi-user collaboration (real-time)

Todoist-style polish is the shape of the backlog; all of it deferred so the time-travel + dependency handling got finished to a correct, demonstrable state.

## Walkthrough notes

Things to demonstrate during the assessment review:

1. **Reconciliation correctness.** Create a parent → add two children → delete parent. Children promote to top-level. Undo restores the nesting. Redo detaches again.
2. **Slider determinism.** Scrub back and forth 10+ times. The step counter and state stay consistent.
3. **Future truncation.** Scrub to an earlier step, then create a new task. The timeline beyond that step is discarded.
4. **Keyboard.** Cmd/Ctrl+Z / Shift+Z outside text fields; native undo still works inside them.

## License

Built as a technical assessment. No license granted for redistribution.
