"use client";

import { TaskItem } from "./task-item";
import { getChildren } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/types";

interface TaskTreeProps {
  task: Task;
  tasks: Record<string, Task>;
  depth?: number;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddChild: (parentId: string) => void;
  onToggleDone: (task: Task) => void;
  onTitleChange: (id: string, title: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onMove: (task: Task) => void;
}

export function TaskTree({
  task,
  tasks,
  depth = 0,
  onDelete,
  onStatusChange,
  onAddChild,
  onToggleDone,
  onTitleChange,
  onDescriptionChange,
  onMove,
}: TaskTreeProps) {
  const children = getChildren(tasks, task.id);
  const parentTitle =
    task.parentId && tasks[task.parentId]
      ? tasks[task.parentId].title
      : undefined;

  return (
    <div
      className={
        depth > 0
          ? "border-l-2 border-muted-foreground/20 pl-4 ml-2"
          : undefined
      }
    >
      <TaskItem
        task={task}
        parentTitle={parentTitle}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onAddChild={onAddChild}
        onToggleDone={onToggleDone}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onMove={onMove}
      />
      {children.length > 0 && (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <TaskTree
              key={child.id}
              task={child}
              tasks={tasks}
              depth={depth + 1}
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
      )}
    </div>
  );
}
