"use client";

import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskList } from "./task-list";
import { TaskForm, type TaskFormSubmit } from "./task-form";
import { MoveTaskDialog } from "./move-task-dialog";
import { TimeTravelSlider } from "./time-travel-slider";
import { createInitialHistory, historyReducer } from "@/lib/reducer";
import { initialAppState } from "@/lib/initial-data";
import type { Task, TaskStatus } from "@/lib/types";

export function TaskManager() {
  const [state, dispatch] = useReducer(
    historyReducer,
    initialAppState,
    createInitialHistory
  );

  const [formOpen, setFormOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);

  const [moveOpen, setMoveOpen] = useState(false);
  const [movingTask, setMovingTask] = useState<Task | null>(null);

  const tasks = state.present.tasks;

  const canUndo = state.pointer > 0;
  const canRedo = state.pointer < state.timeline.length - 1;

  const openCreate = useCallback((parentId: string | null) => {
    setCreateParentId(parentId);
    setFormOpen(true);
  }, []);

  const openMove = useCallback((task: Task) => {
    setMovingTask(task);
    setMoveOpen(true);
  }, []);

  const handleCreate = (data: TaskFormSubmit) => {
    dispatch({
      type: "ADD_TASK",
      payload: {
        title: data.title,
        description: data.description,
        status: data.status,
        parentId: data.parentId,
      },
    });
  };

  const handleMove = (taskId: string, parentId: string | null) => {
    dispatch({
      type: "UPDATE_TASK",
      payload: { id: taskId, updates: { parentId } },
    });
  };

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_TASK", payload: { id } });
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    dispatch({
      type: "UPDATE_TASK",
      payload: { id, updates: { status } },
    });
  };

  const handleToggleDone = (task: Task) => {
    if (task.status === "done") {
      dispatch({
        type: "UPDATE_TASK",
        payload: {
          id: task.id,
          updates: {
            status: task.previousStatus ?? "todo",
            previousStatus: undefined,
          },
        },
      });
    } else {
      dispatch({
        type: "UPDATE_TASK",
        payload: {
          id: task.id,
          updates: { status: "done", previousStatus: task.status },
        },
      });
    }
  };

  const handleTitleChange = (id: string, title: string) => {
    dispatch({ type: "UPDATE_TASK", payload: { id, updates: { title } } });
  };

  const handleDescriptionChange = (id: string, description: string) => {
    dispatch({
      type: "UPDATE_TASK",
      payload: { id, updates: { description } },
    });
  };

  const handleSeek = (index: number) => {
    dispatch({ type: "TIME_TRAVEL", payload: { index } });
  };

  // Keyboard shortcuts: Cmd/Ctrl+Z = undo, Cmd/Ctrl+Shift+Z = redo.
  // Ignored when the focused element is an input/textarea so native editing
  // undo still works in text fields.
  useEffect(() => {
    const isEditable = (el: EventTarget | null): boolean => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        el.isContentEditable
      );
    };

    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      if (e.key !== "z" && e.key !== "Z") return;
      if (isEditable(e.target)) return;
      e.preventDefault();
      if (e.shiftKey) {
        if (canRedo) dispatch({ type: "REDO" });
      } else {
        if (canUndo) dispatch({ type: "UNDO" });
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canUndo, canRedo]);

  const counts = useMemo(() => {
    const all = Object.values(tasks);
    return {
      total: all.length,
      done: all.filter((t) => t.status === "done").length,
      inProgress: all.filter((t) => t.status === "in-progress").length,
    };
  }, [tasks]);

  return (
    <div className="flex flex-col min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto max-w-4xl px-4 py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Task Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {counts.total} task{counts.total === 1 ? "" : "s"}
              {counts.total > 0 &&
                ` · ${counts.done} done · ${counts.inProgress} in progress`}
            </p>
          </div>
          <Button onClick={() => openCreate(null)}>
            <Plus className="h-4 w-4" />
            Add task
          </Button>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-6">
        <TaskList
          tasks={tasks}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onAddChild={openCreate}
          onToggleDone={handleToggleDone}
          onTitleChange={handleTitleChange}
          onDescriptionChange={handleDescriptionChange}
          onMove={openMove}
        />
      </main>

      <div className="sticky bottom-0">
        <TimeTravelSlider
          pointer={state.pointer}
          timelineLength={state.timeline.length}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={() => dispatch({ type: "UNDO" })}
          onRedo={() => dispatch({ type: "REDO" })}
          onSeek={handleSeek}
        />
      </div>

      <TaskForm
        open={formOpen}
        onOpenChange={setFormOpen}
        tasks={tasks}
        initialParentId={createParentId}
        onSubmit={handleCreate}
      />

      <MoveTaskDialog
        open={moveOpen}
        onOpenChange={setMoveOpen}
        task={movingTask}
        tasks={tasks}
        onSubmit={handleMove}
      />
    </div>
  );
}
