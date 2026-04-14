import type {
  Action,
  AppState,
  HistoryState,
  Task,
  TaskStatus,
} from "./types";
import { generateId } from "./utils";

// Reconciliation: any task whose parentId points to a non-existent task
// gets promoted to top-level (parentId = null). Never deletes a task.
// This is the core correctness contract: detach, never orphan.
export function reconcileState(state: AppState): AppState {
  const existingIds = new Set(Object.keys(state.tasks));

  let hasOrphan = false;
  for (const task of Object.values(state.tasks)) {
    if (task.parentId !== null && !existingIds.has(task.parentId)) {
      hasOrphan = true;
      break;
    }
  }
  if (!hasOrphan) return state;

  const reconciled: Record<string, Task> = {};
  for (const [id, task] of Object.entries(state.tasks)) {
    if (task.parentId !== null && !existingIds.has(task.parentId)) {
      reconciled[id] = { ...task, parentId: null };
    } else {
      reconciled[id] = task;
    }
  }
  return { tasks: reconciled };
}

// Derive past/present/future from timeline+pointer. Single source of truth.
function makeHistory(timeline: AppState[], pointer: number): HistoryState {
  return {
    timeline,
    pointer,
    past: timeline.slice(0, pointer),
    present: timeline[pointer],
    future: timeline.slice(pointer + 1),
  };
}

// Commit a new state: reconcile, truncate any redo future, append, advance.
function commit(state: HistoryState, nextPresent: AppState): HistoryState {
  const reconciled = reconcileState(nextPresent);
  const truncated = state.timeline.slice(0, state.pointer + 1);
  const nextTimeline = [...truncated, reconciled];
  return makeHistory(nextTimeline, nextTimeline.length - 1);
}

// Move the pointer without mutating the timeline (undo/redo/slider).
function travel(state: HistoryState, newPointer: number): HistoryState {
  const bounded = Math.max(0, Math.min(state.timeline.length - 1, newPointer));
  if (bounded === state.pointer) return state;
  return makeHistory(state.timeline, bounded);
}

export function createInitialHistory(initial: AppState): HistoryState {
  const reconciled = reconcileState(initial);
  return makeHistory([reconciled], 0);
}

export function historyReducer(
  state: HistoryState,
  action: Action
): HistoryState {
  switch (action.type) {
    case "ADD_TASK": {
      const id = generateId();
      const task: Task = {
        id,
        title: action.payload.title.trim(),
        description: (action.payload.description ?? "").trim(),
        status: action.payload.status ?? ("todo" satisfies TaskStatus),
        parentId: action.payload.parentId ?? null,
        createdAt: Date.now(),
      };
      const next: AppState = {
        tasks: { ...state.present.tasks, [id]: task },
      };
      return commit(state, next);
    }

    case "UPDATE_TASK": {
      const existing = state.present.tasks[action.payload.id];
      if (!existing) return state;
      const updated: Task = { ...existing, ...action.payload.updates };
      const next: AppState = {
        tasks: { ...state.present.tasks, [action.payload.id]: updated },
      };
      return commit(state, next);
    }

    case "DELETE_TASK": {
      if (!state.present.tasks[action.payload.id]) return state;
      const { [action.payload.id]: _removed, ...rest } = state.present.tasks;
      void _removed;
      // Children of the deleted task are now orphaned; reconcile in commit()
      // will detach them to top-level rather than deleting them.
      const next: AppState = { tasks: rest };
      return commit(state, next);
    }

    case "UNDO": {
      return travel(state, state.pointer - 1);
    }

    case "REDO": {
      return travel(state, state.pointer + 1);
    }

    case "TIME_TRAVEL": {
      return travel(state, action.payload.index);
    }

    default: {
      const _exhaustive: never = action;
      void _exhaustive;
      return state;
    }
  }
}
