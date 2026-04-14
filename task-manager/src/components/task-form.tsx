"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskStatus } from "@/lib/types";

const NONE_VALUE = "__none__";
const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export type TaskFormSubmit =
  | {
      mode: "create";
      title: string;
      description: string;
      status: TaskStatus;
      parentId: string | null;
    }
  | {
      mode: "update";
      id: string;
      title: string;
      description: string;
      status: TaskStatus;
    };

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tasks: Record<string, Task>;
  editingTask?: Task | null;
  initialParentId?: string | null;
  onSubmit: (data: TaskFormSubmit) => void;
}

export function TaskForm({
  open,
  onOpenChange,
  tasks,
  editingTask,
  initialParentId,
  onSubmit,
}: TaskFormProps) {
  const isEdit = Boolean(editingTask);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [parentId, setParentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setStatus(editingTask.status);
      setParentId(editingTask.parentId);
    } else {
      setTitle("");
      setDescription("");
      setStatus("todo");
      setParentId(initialParentId ?? null);
    }
    setError(null);
  }, [open, editingTask, initialParentId]);

  const parentOptions = Object.values(tasks)
    .filter((t) => (editingTask ? t.id !== editingTask.id : true))
    .sort((a, b) => a.createdAt - b.createdAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required.");
      return;
    }
    if (editingTask) {
      onSubmit({
        mode: "update",
        id: editingTask.id,
        title: trimmed,
        description: description.trim(),
        status,
      });
    } else {
      onSubmit({
        mode: "create",
        title: trimmed,
        description: description.trim(),
        status,
        parentId,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the task details below."
              : "Add a task. Pick a parent to make it a subtask."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs doing?"
              autoFocus
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as TaskStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isEdit && (
            <div className="grid gap-2">
              <Label>Parent task</Label>
              <Select
                value={parentId ?? NONE_VALUE}
                onValueChange={(v) =>
                  setParentId(v === NONE_VALUE ? null : (v as string))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="None (top-level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>None (top-level)</SelectItem>
                  {parentOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.title || "(untitled)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{isEdit ? "Save changes" : "Add task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
