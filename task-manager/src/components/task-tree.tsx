"use client";

import { TaskItem } from "./task-item";
import { getChildren } from "@/lib/utils";
import type { Task, TaskStatus } from "@/lib/types";

interface TaskTreeProps {
  task: Task;
  tasks: Record<string, Task>;
  depth?: number;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddChild: (parentId: string) => void;
}

export function TaskTree({
  task,
  tasks,
  depth = 0,
  onEdit,
  onDelete,
  onStatusChange,
  onAddChild,
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
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusChange={onStatusChange}
        onAddChild={onAddChild}
      />
      {children.length > 0 && (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <TaskTree
              key={child.id}
              task={child}
              tasks={tasks}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
