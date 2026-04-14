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

export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  const diff = Math.max(0, now - timestamp);
  const sec = Math.floor(diff / 1000);
  if (sec < 10) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  const week = Math.floor(day / 7);
  if (week < 5) return `${week}w ago`;
  const month = Math.floor(day / 30);
  if (month < 12) return `${month}mo ago`;
  const year = Math.floor(day / 365);
  return `${year}y ago`;
}
