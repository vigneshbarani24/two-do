"use client";

import { useMemo, useReducer, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskList } from "./task-list";
import { TaskForm, type TaskFormSubmit } from "./task-form";
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [createParentId, setCreateParentId] = useState<string | null>(null);

  const tasks = state.present.tasks;

  const canUndo = state.pointer > 0;
  const canRedo = state.pointer < state.timeline.length - 1;

  const openCreate = (parentId: string | null) => {
    setEditingTask(null);
    setCreateParentId(parentId);
    setFormOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setCreateParentId(null);
    setFormOpen(true);
  };

  const handleSubmit = (data: TaskFormSubmit) => {
    if (data.mode === "create") {
      dispatch({
        type: "ADD_TASK",
        payload: {
          title: data.title,
          description: data.description,
          status: data.status,
          parentId: data.parentId,
        },
      });
    } else {
      dispatch({
        type: "UPDATE_TASK",
        payload: {
          id: data.id,
          updates: {
            title: data.title,
            description: data.description,
            status: data.status,
          },
        },
      });
    }
  };

  const handleDelete = (id: string) => {
    dispatch({ type: "DELETE_TASK", payload: { id } });
  };

  const handleStatusChange = (id: string, status: TaskStatus) => {
    dispatch({ type: "UPDATE_TASK", payload: { id, updates: { status } } });
  };

  const handleSeek = (index: number) => {
    dispatch({ type: "TIME_TRAVEL", payload: { index } });
  };

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
          onEdit={openEdit}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onAddChild={openCreate}
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
        editingTask={editingTask}
        initialParentId={createParentId}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
