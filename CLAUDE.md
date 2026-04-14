# CLAUDE.md — AI Vibe Coding Session: Collaborative Task Manager

## Project Overview

A collaborative task manager with time-travel (undo/redo) state management. Built as a client-side-only Next.js app using React state. No database, no server, no API routes. All state lives in-memory in the browser.

**Core challenge:** When a parent task is undone, all dependent child tasks must be cleanly detached (promoted to top-level tasks), never deleted or corrupted.

---

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | Next.js (App Router) | Single page app, no SSR needed for this |
| Language | TypeScript | Strict mode enabled |
| State | React useState + useReducer | All state client-side, no external state lib |
| UI | shadcn/ui + Tailwind CSS | Light theme only. Clean, minimal |
| Icons | Lucide React | Comes with shadcn |
| Deployment | Vercel | Static export friendly |

**Explicitly NOT using:** Database, backend, API routes, server actions, auth, external state management (Redux, Zustand, etc.)

---

## Architecture

### State Model

The entire app state is a single immutable snapshot. Every mutation creates a new snapshot pushed onto a history stack.

```typescript
// Core types
interface Task {
  id: string;           // nanoid or crypto.randomUUID()
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "done";
  parentId: string | null;  // null = top-level task
  createdAt: number;        // Date.now() timestamp
}

interface AppState {
  tasks: Record<string, Task>;  // Map of id -> Task for O(1) lookups
}

interface HistoryState {
  past: AppState[];       // Undo stack
  present: AppState;      // Current state
  future: AppState[];     // Redo stack
  pointer: number;        // Current position in full timeline (for slider)
  timeline: AppState[];   // Full ordered list of all states (for slider navigation)
}
```

### Time-Travel Implementation

Use an **immutable snapshot history** pattern:

1. Every action (create, update, delete, detach) produces a new `AppState` snapshot.
2. The snapshot is pushed to `timeline[]` and `past[]`.
3. `future[]` is cleared on any new action (standard undo/redo behavior).
4. The slider maps to `timeline[]` index. Moving the slider sets `present` to `timeline[pointer]`.
5. Undo: pop from `past`, push current to `future`, set new present.
6. Redo: pop from `future`, push current to `past`, set new present.

### Dependency Handling Strategy: DETACH CHILDREN

**When a parent task is undone (removed via undo):**

1. Identify all direct children of the undone parent (`task.parentId === undoneTask.id`).
2. Set each child's `parentId` to `null` — promoting them to top-level tasks.
3. Children retain all their own properties (title, status, description).
4. This cascades: if a grandparent is undone, the parent becomes top-level, and grandchildren stay attached to the (now top-level) parent.
5. **Never delete children. Never leave orphaned parentId references.**

**Implementation rule:** Before applying any undo state, run a reconciliation pass:

```typescript
function reconcileState(newState: AppState): AppState {
  const taskIds = new Set(Object.keys(newState.tasks));
  const reconciled = { ...newState.tasks };

  for (const [id, task] of Object.entries(reconciled)) {
    if (task.parentId && !taskIds.has(task.parentId)) {
      // Parent doesn't exist in this state — detach
      reconciled[id] = { ...task, parentId: null };
    }
  }

  return { tasks: reconciled };
}
```

This reconciliation runs on EVERY state transition (undo, redo, slider move) to guarantee consistency.

---

## Reducer Actions

Implement a single `useReducer` with these action types:

```typescript
type Action =
  | { type: "ADD_TASK"; payload: { title: string; description?: string; parentId?: string } }
  | { type: "UPDATE_TASK"; payload: { id: string; updates: Partial<Pick<Task, "title" | "description" | "status">> } }
  | { type: "DELETE_TASK"; payload: { id: string } }
  | { type: "SET_PARENT"; payload: { taskId: string; parentId: string | null } }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "TIME_TRAVEL"; payload: { index: number } };
```

**DELETE_TASK behavior:** Deleting a task also detaches its children (sets their `parentId` to `null`). It does NOT cascade-delete children.

---

## Component Tree

```
app/
├── layout.tsx                    # Root layout, light theme, font setup
├── page.tsx                      # Main page — renders TaskManager
├── components/
│   ├── task-manager.tsx          # Top-level orchestrator, owns useReducer
│   ├── task-list.tsx             # Renders tree of tasks (top-level + nested children)
│   ├── task-item.tsx             # Single task card with status, edit, delete
│   ├── task-form.tsx             # Create/edit task dialog (shadcn Dialog + Form)
│   ├── time-travel-slider.tsx    # Slider + undo/redo buttons
│   └── task-tree.tsx             # Recursive component for parent-child nesting
├── lib/
│   ├── types.ts                  # All TypeScript interfaces
│   ├── reducer.ts                # Main state reducer + reconciliation logic
│   ├── utils.ts                  # Helper functions (id generation, tree utils)
│   └── initial-data.ts           # Optional seed data for demo purposes
```

---

## UI Specifications

### Layout
- Full-width container with max-w-4xl centered.
- Top section: App title + "Add Task" button.
- Middle section: Task list rendered as an indented tree (children nested under parents).
- Bottom section (sticky): Time-travel slider bar.

### Task Card (task-item.tsx)
- shadcn `Card` component.
- Shows: title, description (truncated), status badge, parent indicator if child.
- Actions: Edit (pencil icon), Delete (trash icon), Change status (dropdown).
- Children are indented with a left border or visual connector.
- When a task has been detached (was a child, now top-level after undo), show a subtle "detached" indicator (optional, nice-to-have).

### Task Form (task-form.tsx)
- shadcn `Dialog` with `Input` for title, `Textarea` for description.
- `Select` dropdown to pick parent task (optional). List only existing top-level tasks + other tasks as options.
- Status selector: todo / in-progress / done.

### Time-Travel Slider (time-travel-slider.tsx)
- shadcn `Slider` component spanning the full width.
- Min = 0, Max = timeline.length - 1, Value = current pointer.
- Undo button (ArrowLeft icon) and Redo button (ArrowRight icon) flanking the slider.
- Display: "Step X of Y" label.
- Disable undo when past is empty. Disable redo when future is empty.

### Theme
- Light theme only. Set in `globals.css` or Tailwind config.
- Use shadcn's default light palette. No custom color overrides unless needed.
- Clean, minimal, professional. This is an assessment, not a design contest.

---

## Build Order (Priority Sequence)

Follow this exact sequence. Each step should be a working increment.

### Step 1: Project Scaffold (5 min)
- `npx create-next-app@latest` with TypeScript, Tailwind, App Router, src directory.
- Install shadcn/ui: `npx shadcn@latest init` (Light theme, default style).
- Add components: `npx shadcn@latest add button card dialog input textarea select slider badge dropdown-menu`
- Create the folder structure above.
- Create `lib/types.ts` with all interfaces.

### Step 2: State Reducer (15 min)
- Implement `lib/reducer.ts` with full HistoryState management.
- Implement `reconcileState()` function.
- Every action: snapshot current state to past, clear future, apply action, reconcile.
- UNDO/REDO/TIME_TRAVEL: move pointer, reconcile the target state.
- Write this carefully — this is the core being evaluated.

### Step 3: Task CRUD UI (15 min)
- Build `task-manager.tsx` with `useReducer`.
- Build `task-form.tsx` — create task dialog.
- Build `task-item.tsx` — display card with edit/delete.
- Build `task-list.tsx` — flat list first, get it working.

### Step 4: Parent-Child Relationships (10 min)
- Add parent selector to task form.
- Build `task-tree.tsx` — recursive render of children.
- Update `task-list.tsx` to render tree structure.
- Visual indentation with left-border for children.

### Step 5: Time-Travel Slider (10 min)
- Build `time-travel-slider.tsx`.
- Wire slider to TIME_TRAVEL action.
- Wire undo/redo buttons.
- Show step counter.

### Step 6: Edge Cases & Polish (10 min)
- Test: Create parent -> add children -> undo parent creation -> verify children detach.
- Test: Redo after undo restores original parent-child structure.
- Test: Slider scrubbing back and forth doesn't corrupt state.
- Empty state message when no tasks.
- Disable buttons appropriately.

### Step 7: Demo Prep (5 min)
- Add 2-3 seed tasks in `initial-data.ts` so the app isn't empty on load.
- Verify the full flow works end-to-end.
- Clean up any console errors.

---

## Critical Rules

1. **State is IMMUTABLE.** Never mutate. Always spread/copy. Every action produces a fresh AppState.
2. **Reconcile on EVERY state transition.** The `reconcileState()` function runs after undo, redo, and slider navigation.
3. **No orphaned references.** If a task's parentId points to a non-existent task, it MUST be set to null.
4. **Children are DETACHED, never deleted** when their parent disappears.
5. **No backend.** No API routes. No fetch calls. No localStorage (unless explicitly adding persistence as polish).
6. **Think aloud.** Comment your reducer logic. Name your functions clearly. The evaluator reads your code.

---

## What to Say During Walkthrough

Be ready to explain:

1. **State model:** "I use an immutable snapshot history. Every action creates a new AppState pushed to a timeline array. The slider maps directly to timeline indices."

2. **Dependency handling:** "I chose the detach strategy. When a parent is removed via undo, a reconciliation pass promotes all orphaned children to top-level tasks. This runs on every state transition, not just undo."

3. **AI usage:** "I used Claude Code to scaffold the reducer and component structure. I validated the reconciliation logic myself and wrote the edge case handling for cascading detachment."

4. **What I'd improve:** "Add localStorage persistence, drag-and-drop task reordering, optimistic batch undo (undo multiple steps at once), and a visual diff showing what changed between history steps."

---

## File Generation Checklist

When building, generate files in this order:
1. `lib/types.ts`
2. `lib/utils.ts`
3. `lib/reducer.ts` (most important file — spend time here)
4. `lib/initial-data.ts`
5. `components/task-form.tsx`
6. `components/task-item.tsx`
7. `components/task-tree.tsx`
8. `components/task-list.tsx`
9. `components/time-travel-slider.tsx`
10. `components/task-manager.tsx`
11. `app/page.tsx`
12. `app/layout.tsx` (update if needed)
