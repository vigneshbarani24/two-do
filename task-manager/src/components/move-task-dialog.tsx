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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDescendantIds } from "@/lib/utils";
import type { Task } from "@/lib/types";

const NONE_VALUE = "__none__";

interface MoveTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  tasks: Record<string, Task>;
  onSubmit: (taskId: string, parentId: string | null) => void;
}

export function MoveTaskDialog({
  open,
  onOpenChange,
  task,
  tasks,
  onSubmit,
}: MoveTaskDialogProps) {
  const [parentId, setParentId] = useState<string | null>(
    task?.parentId ?? null
  );

  useEffect(() => {
    if (open) setParentId(task?.parentId ?? null);
  }, [open, task]);

  if (!task) return null;

  const excluded = getDescendantIds(tasks, task.id);
  excluded.add(task.id);

  const options = Object.values(tasks)
    .filter((t) => !excluded.has(t.id))
    .sort((a, b) => a.createdAt - b.createdAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentId !== task.parentId) onSubmit(task.id, parentId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move task</DialogTitle>
          <DialogDescription>
            Reassign &ldquo;{task.title || "(untitled)"}&rdquo; to a different
            parent. Self and descendants are excluded to prevent cycles.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Parent task</Label>
            <Select
              value={parentId ?? NONE_VALUE}
              onValueChange={(v) =>
                setParentId(v === NONE_VALUE ? null : (v as string))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>None (top-level)</SelectItem>
                {options.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.title || "(untitled)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {options.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No valid parent options — this task can only be top-level.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Move</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
