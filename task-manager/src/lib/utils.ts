import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Task } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getTopLevelTasks(tasks: Record<string, Task>): Task[] {
  return Object.values(tasks)
    .filter((t) => t.parentId === null)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getChildren(
  tasks: Record<string, Task>,
  parentId: string
): Task[] {
  return Object.values(tasks)
    .filter((t) => t.parentId === parentId)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export function getDescendantIds(
  tasks: Record<string, Task>,
  parentId: string
): Set<string> {
  const result = new Set<string>();
  const queue: string[] = [parentId];
  while (queue.length > 0) {
    const id = queue.shift()!;
    for (const t of Object.values(tasks)) {
      if (t.parentId === id && !result.has(t.id)) {
        result.add(t.id);
        queue.push(t.id);
      }
    }
  }
  return result;
}
