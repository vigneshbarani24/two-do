# Implementation Plan

- [ ] 1. Project scaffold
    - Run `npx create-next-app@latest task-manager --typescript --tailwind --app --src-dir`
    - Initialize shadcn: `npx shadcn@latest init` (light theme, default style, New York variant)
    - Add components: `npx shadcn@latest add button card dialog input textarea select slider badge dropdown-menu`
    - Create directory structure: `src/components/`, `src/lib/`
    - Verify dev server runs clean
    - _Requirements: NFR-1, NFR-2, NFR-3_

- [ ] 2. Type definitions (`lib/types.ts`)
    - Define Task interface (id, title, description, status, parentId, createdAt)
    - Define TaskStatus union type
    - Define AppState interface (tasks as Record<string, Task>)
    - Define HistoryState interface (past, present, future, timeline, pointer)
    - Define Action union type (ADD_TASK, UPDATE_TASK, DELETE_TASK, UNDO, REDO, TIME_TRAVEL)
    - _Requirements: 1.1, 2.1, 3.1_

- [ ] 3. Utility functions (`lib/utils.ts`)
    - `generateId()` — wraps crypto.randomUUID()
    - `getChildren(tasks, parentId)` — returns array of child tasks
    - `getTopLevelTasks(tasks)` — returns tasks with parentId === null
    - `getTaskTree(tasks)` — builds nested tree structure for rendering
    - _Requirements: 2.2_

- [ ] 4. State reducer and reconciliation (`lib/reducer.ts`) ← CRITICAL
    - Implement `reconcileState(state: AppState): AppState`
        - Scan all tasks for parentId referencing non-existent task
        - Set orphaned parentId to null
        - Return state unchanged if no orphans found (optimization)
    - Implement `historyReducer(state: HistoryState, action: Action): HistoryState`
        - ADD_TASK: generate ID, create task, snapshot to past, clear future, append timeline
        - UPDATE_TASK: update task fields, snapshot to past, clear future, append timeline
        - DELETE_TASK: remove task, detach children via reconcile, snapshot to past, clear future, append timeline
        - UNDO: pop past, push present to future, set new present, reconcile, update pointer
        - REDO: pop future, push present to past, set new present, reconcile, update pointer
        - TIME_TRAVEL: set present to timeline[index], rebuild past/future from timeline, reconcile
    - _Requirements: 1.2, 1.3, 1.4, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 4.1, 4.2, 4.3_

- [ ] 5. Seed data (`lib/initial-data.ts`)
    - Create 2-3 sample tasks (one parent with one child) for demo purposes
    - Export as initial AppState
    - _Requirements: 1.5_

- [ ] 6. TaskForm component (`components/task-form.tsx`)
    - Dialog with controlled form inputs
    - Title input (required), description textarea (optional)
    - Parent selector — dropdown of existing tasks, "None" option for top-level
    - Status selector — todo / in-progress / done
    - Support both create mode (empty form) and edit mode (pre-populated)
    - On submit: dispatch ADD_TASK or UPDATE_TASK
    - _Requirements: 1.1, 1.2, 1.3, 2.1_

- [ ] 7. TaskItem component (`components/task-item.tsx`)
    - shadcn Card showing title, truncated description, status Badge
    - Edit button → opens TaskForm in edit mode
    - Delete button → dispatches DELETE_TASK
    - Status dropdown → dispatches UPDATE_TASK with new status
    - Visual indicator if task is a child (show "Sub-task of: [parent title]")
    - _Requirements: 1.3, 1.4_

- [ ] 8. TaskTree component (`components/task-tree.tsx`)
    - Recursive component: renders TaskItem + children
    - Accepts task and allTasks, filters children where parentId matches
    - Indentation: each nesting level adds left padding (pl-6) and left border
    - _Requirements: 2.2_

- [ ] 9. TaskList component (`components/task-list.tsx`)
    - Filters top-level tasks (parentId === null)
    - Renders each through TaskTree for recursive child display
    - Shows empty state when no tasks exist
    - _Requirements: 1.5, 2.2_

- [ ] 10. TimeTravelSlider component (`components/time-travel-slider.tsx`)
    - shadcn Slider: min=0, max=timeline.length-1, value=pointer
    - On change: dispatch TIME_TRAVEL with slider value
    - Undo button (disabled when past.length === 0)
    - Redo button (disabled when future.length === 0)
    - Step label: "Step {pointer + 1} of {timeline.length}"
    - Only visible when timeline.length > 1
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 11. TaskManager orchestrator (`components/task-manager.tsx`)
    - Initialize useReducer with historyReducer and initial state
    - Render: header with title + Add Task button, TaskList, TimeTravelSlider (sticky bottom)
    - Pass state.present.tasks and dispatch to children
    - _Requirements: All_

- [ ] 12. Wire up page.tsx
    - Import and render TaskManager
    - Ensure layout.tsx has light theme class, clean font
    - _Requirements: NFR-2_

- [ ] 13. Edge case testing
    - Create parent → add 2 children → undo parent creation → verify children promoted to top-level
    - Redo → verify parent-child restored
    - Slider scrub back and forth 10+ times → verify no state corruption
    - Delete parent directly → verify children detached
    - Create grandparent → parent → child → undo grandparent → verify parent becomes top-level, child stays under parent
    - _Requirements: 4.1, 4.2, 4.3_

- [ ] 14. UI polish
    - Responsive layout (works on mobile viewport)
    - Loading states / transitions
    - Keyboard accessibility (Enter to submit form, Escape to close dialog)
    - Clean up console warnings/errors
    - _Requirements: NFR-1, NFR-2_
