import type { AppState, Task } from "./types";

const base = Date.now();

const seed: Task[] = [
  {
    id: "seed-1",
    title: "Ship the task manager assessment",
    description: "Client-side Next.js with time-travel undo/redo.",
    status: "in-progress",
    parentId: null,
    createdAt: base,
  },
  {
    id: "seed-2",
    title: "Wire the reducer and reconciliation",
    description: "Detach children when their parent is removed.",
    status: "done",
    parentId: "seed-1",
    createdAt: base + 1,
  },
  {
    id: "seed-3",
    title: "Build the time-travel slider",
    description: "Map slider index to timeline snapshot.",
    status: "todo",
    parentId: "seed-1",
    createdAt: base + 2,
  },
  {
    id: "seed-4",
    title: "Review assessment walkthrough notes",
    description: "Rehearse the state-model explanation.",
    status: "todo",
    parentId: null,
    createdAt: base + 3,
  },
];

export const initialAppState: AppState = {
  tasks: Object.fromEntries(seed.map((t) => [t.id, t])),
};
