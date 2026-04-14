"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pencil, Trash2, MoreHorizontal, Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done",
};

const STATUS_VARIANT: Record<
  TaskStatus,
  "default" | "secondary" | "outline"
> = {
  todo: "outline",
  "in-progress": "secondary",
  done: "default",
};

interface TaskItemProps {
  task: Task;
  parentTitle?: string;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddChild: (parentId: string) => void;
}

export function TaskItem({
  task,
  parentTitle,
  onEdit,
  onDelete,
  onStatusChange,
  onAddChild,
}: TaskItemProps) {
  return (
    <Card className="py-3">
      <CardContent className="px-4 py-0">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3
                className={
                  task.status === "done"
                    ? "font-medium text-base text-muted-foreground line-through"
                    : "font-medium text-base"
                }
              >
                {task.title || "(untitled)"}
              </h3>
              <Badge variant={STATUS_VARIANT[task.status]}>
                {STATUS_LABEL[task.status]}
              </Badge>
            </div>
            {task.description && (
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
            {parentTitle && (
              <p className="mt-1 text-xs text-muted-foreground">
                Subtask of: <span className="font-medium">{parentTitle}</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Add subtask"
              onClick={() => onAddChild(task.id)}
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Edit task"
              onClick={() => onEdit(task)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete task"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Change status"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                }
              />
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Set status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(STATUS_LABEL) as TaskStatus[]).map((s) => (
                  <DropdownMenuItem
                    key={s}
                    onClick={() => onStatusChange(task.id, s)}
                    disabled={s === task.status}
                  >
                    {STATUS_LABEL[s]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
