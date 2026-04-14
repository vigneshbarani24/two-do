"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, MoreHorizontal, Plus, Move } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/types";
import { cn, formatRelativeTime } from "@/lib/utils";

const STATUS_LABEL: Record<TaskStatus, string> = {
  todo: "Todo",
  "in-progress": "In progress",
  done: "Done",
};

const STATUS_BADGE: Record<TaskStatus, string> = {
  todo: "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-50",
  "in-progress":
    "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50",
  done: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
};

const STATUS_ACCENT: Record<TaskStatus, string> = {
  todo: "border-l-slate-300",
  "in-progress": "border-l-blue-400",
  done: "border-l-emerald-400",
};

interface TaskItemProps {
  task: Task;
  parentTitle?: string;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onAddChild: (parentId: string) => void;
  onToggleDone: (task: Task) => void;
  onTitleChange: (id: string, title: string) => void;
  onDescriptionChange: (id: string, description: string) => void;
  onMove: (task: Task) => void;
}

export function TaskItem({
  task,
  parentTitle,
  onDelete,
  onStatusChange,
  onAddChild,
  onToggleDone,
  onTitleChange,
  onDescriptionChange,
  onMove,
}: TaskItemProps) {
  const isDone = task.status === "done";

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(task.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [editingDesc, setEditingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState(task.description);
  const descInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editingTitle) setTitleDraft(task.title);
  }, [task.title, editingTitle]);

  useEffect(() => {
    if (!editingDesc) setDescDraft(task.description);
  }, [task.description, editingDesc]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingDesc && descInputRef.current) {
      descInputRef.current.focus();
      descInputRef.current.setSelectionRange(
        descDraft.length,
        descDraft.length
      );
    }
  }, [editingDesc, descDraft.length]);

  const commitTitle = () => {
    const next = titleDraft.trim();
    if (!next) {
      setTitleDraft(task.title);
      setEditingTitle(false);
      return;
    }
    if (next !== task.title) onTitleChange(task.id, next);
    setEditingTitle(false);
  };

  const cancelTitle = () => {
    setTitleDraft(task.title);
    setEditingTitle(false);
  };

  const commitDesc = () => {
    const next = descDraft.trim();
    if (next !== task.description) onDescriptionChange(task.id, next);
    setEditingDesc(false);
  };

  const cancelDesc = () => {
    setDescDraft(task.description);
    setEditingDesc(false);
  };

  return (
    <Card
      className={cn(
        "py-3 border-l-4 transition-colors",
        STATUS_ACCENT[task.status]
      )}
    >
      <CardContent className="px-4 py-0">
        <div className="flex items-start gap-3">
          <Checkbox
            checked={isDone}
            onCheckedChange={() => onToggleDone(task)}
            aria-label={isDone ? "Mark as not done" : "Mark as done"}
            className="mt-1"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {editingTitle ? (
                <Input
                  ref={titleInputRef}
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitTitle();
                    } else if (e.key === "Escape") {
                      e.preventDefault();
                      cancelTitle();
                    }
                  }}
                  className="h-8"
                />
              ) : (
                <h3
                  role="button"
                  tabIndex={0}
                  onClick={() => setEditingTitle(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEditingTitle(true);
                    }
                  }}
                  className={cn(
                    "font-medium text-base cursor-text rounded px-0.5 -mx-0.5 hover:bg-accent/60",
                    isDone && "text-muted-foreground line-through"
                  )}
                >
                  {task.title || "(untitled)"}
                </h3>
              )}
              <Badge
                variant="outline"
                className={cn("font-normal", STATUS_BADGE[task.status])}
              >
                {STATUS_LABEL[task.status]}
              </Badge>
            </div>

            {editingDesc ? (
              <Textarea
                ref={descInputRef}
                value={descDraft}
                onChange={(e) => setDescDraft(e.target.value)}
                onBlur={commitDesc}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelDesc();
                  } else if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    commitDesc();
                  }
                }}
                placeholder="Add description"
                rows={3}
                className="mt-1.5 text-sm"
              />
            ) : task.description ? (
              <p
                role="button"
                tabIndex={0}
                onClick={() => setEditingDesc(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setEditingDesc(true);
                  }
                }}
                className="mt-1 text-sm text-muted-foreground line-clamp-3 cursor-text rounded px-0.5 -mx-0.5 hover:bg-accent/60"
              >
                {task.description}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setEditingDesc(true)}
                className="mt-1 text-xs text-muted-foreground/70 hover:text-muted-foreground"
              >
                + Add description
              </button>
            )}

            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              <span
                className="text-xs text-muted-foreground"
                suppressHydrationWarning
              >
                Created {formatRelativeTime(task.createdAt)}
              </span>
              {parentTitle && (
                <span className="text-xs text-muted-foreground">
                  · Subtask of{" "}
                  <span className="font-medium">{parentTitle}</span>
                </span>
              )}
            </div>
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
              aria-label="Move to different parent"
              onClick={() => onMove(task)}
            >
              <Move className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Change status"
                  />
                }
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
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
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Delete task"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
