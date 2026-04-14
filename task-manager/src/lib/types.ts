export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  previousStatus?: TaskStatus;
  parentId: string | null;
  createdAt: number;
}

export interface AppState {
  tasks: Record<string, Task>;
}

export interface HistoryState {
  past: AppState[];
  present: AppState;
  future: AppState[];
  timeline: AppState[];
  pointer: number;
}

export type Action =
  | {
      type: "ADD_TASK";
      payload: {
        title: string;
        description?: string;
        status?: TaskStatus;
        parentId?: string | null;
      };
    }
  | {
      type: "UPDATE_TASK";
      payload: {
        id: string;
        updates: Partial<
          Pick<
            Task,
            "title" | "description" | "status" | "previousStatus" | "parentId"
          >
        >;
      };
    }
  | { type: "DELETE_TASK"; payload: { id: string } }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "TIME_TRAVEL"; payload: { index: number } };
