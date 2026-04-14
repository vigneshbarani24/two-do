# Requirements Document

## Introduction

A client-side collaborative task manager with time-travel undo/redo. Built for a 90-minute AI vibe coding assessment. Users can create tasks with parent-child relationships and navigate through state history using a slider. When a parent task is undone, children are detached (promoted to top-level), never deleted.

No backend. No database. All state in-memory via React.

## Requirements

### Requirement 1: Task CRUD

**User Story:** As a user, I want to create, view, edit, and delete tasks so that I can manage my work.

**Acceptance Criteria:**
1.1 GIVEN the task manager is loaded WHEN the user clicks "Add Task" THEN the system SHALL display a form with title (required), description (optional), status selector, and parent selector.
1.2 GIVEN a valid title WHEN the user submits the form THEN the system SHALL create a new task with a unique ID, default status "todo", and display it in the task list.
1.3 GIVEN an existing task WHEN the user clicks edit THEN the system SHALL populate the form with current values and allow updates.
1.4 GIVEN an existing task WHEN the user clicks delete THEN the system SHALL remove the task and detach all its children (set their parentId to null).
1.5 GIVEN the task list is empty WHEN the page loads THEN the system SHALL display an empty state message.

### Requirement 2: Parent-Child Relationships

**User Story:** As a user, I want to organize tasks into parent-child hierarchies so that I can represent task dependencies.

**Acceptance Criteria:**
2.1 GIVEN the task creation form WHEN the user selects a parent task THEN the system SHALL create the new task as a child of the selected parent.
2.2 GIVEN tasks with parent-child relationships WHEN the task list renders THEN the system SHALL display children indented under their parent with a visual connector.
2.3 GIVEN a parent task with children WHEN the parent is deleted THEN the system SHALL set each child's parentId to null, promoting them to top-level tasks.
2.4 WHEN a task's parentId references a non-existent task THEN the system SHALL set parentId to null.

### Requirement 3: Time-Travel State (Undo/Redo)

**User Story:** As a user, I want to undo and redo my actions and scrub through history so that I can navigate previous states.

**Acceptance Criteria:**
3.1 GIVEN any state-mutating action WHEN it completes THEN the system SHALL push the previous state onto the undo stack and clear the redo stack.
3.2 GIVEN the undo stack is non-empty WHEN the user clicks Undo THEN the system SHALL restore the previous state, push current to redo stack, and reconcile orphaned children.
3.3 GIVEN the redo stack is non-empty WHEN the user clicks Redo THEN the system SHALL restore the next state, push current to undo stack, and reconcile orphaned children.
3.4 GIVEN a history timeline WHEN the user moves the slider THEN the system SHALL set the current state to the snapshot at that slider position and reconcile.
3.5 WHEN the undo stack is empty THEN the system SHALL disable the Undo button.
3.6 WHEN the redo stack is empty THEN the system SHALL disable the Redo button.
3.7 GIVEN the slider is at position N WHEN the user performs a new action THEN the system SHALL discard all timeline entries after position N.

### Requirement 4: Dependency Reconciliation (Detach Strategy)

**User Story:** As a user, I want children to become independent tasks when their parent is removed via undo, so that no data is lost.

**Acceptance Criteria:**
4.1 GIVEN a state transition via undo/redo/slider WHEN the resulting state contains a task whose parentId references a non-existent task THEN the system SHALL set that task's parentId to null.
4.2 GIVEN a parent with nested children (grandchildren) WHEN the grandparent is undone THEN the system SHALL detach only direct children of the removed task; grandchildren remain attached to their (now top-level) parent.
4.3 WHEN reconciliation runs THEN the system SHALL never delete any task that exists in the target state snapshot.

## Non-Functional Requirements

### NFR 1: Performance
- WHEN the timeline contains up to 100 snapshots THEN slider scrubbing SHALL feel instantaneous (< 16ms render).

### NFR 2: Usability
- THE SYSTEM SHALL use shadcn/ui components with light theme only.
- THE SYSTEM SHALL be mobile-responsive.

### NFR 3: Code Quality
- All components SHALL be written in TypeScript with strict mode.
- State mutations SHALL be immutable (no direct mutation of state objects).

## Out of Scope

- Authentication and user accounts
- Backend / database / persistence (no localStorage unless polish time)
- Real-time collaboration (multi-user)
- Drag-and-drop task reordering
- Task search or filtering
- Notifications or AI assistant features

## Open Questions

- Should the slider show timestamps or just step numbers? (Default: step numbers)
- Should there be a max history depth? (Default: unlimited for assessment scope)
