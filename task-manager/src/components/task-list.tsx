"use client";

import { TaskTree } from "./task-tree";
import { getTopLevelTasks } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";

interface TaskListProps {
  tasks: Record<string, Task>;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddChild: (parentId: string) => void;
  onToggleDone: (task: Task) => void;
  onTitleChange: (id: string, title: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onMove: (task: Task) => void;
}

export function TaskList({
  tasks,
  onDelete,
  onStatusChange,
  onAddChild,
  onToggleDone,
  onTitleChange,
  onDescriptionChange,
  onMove,
}: TaskListProps) {
  const topLevel = getTopLevelTasks(tasks);

  if (topLevel.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="rounded-full bg-muted p-3">
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium">No tasks yet</p>
          <p className="text-sm text-muted-foreground">
            Click &quot;Add task&quot; to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {topLevel.map((t) => (
        <TaskTree
          key={t.id}
          task={t}
          tasks={tasks}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
          onAddChild={onAddChild}
          onToggleDone={onToggleDone}
          onTitleChange={onTitleChange}
          onDescriptionChange={onDescriptionChange}
          onMove={onMove}
        />
      ))}
    </div>
  );
}
