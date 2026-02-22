"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import {
  ListChecks,
  Plus,
  X,
  Circle,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";

type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

const STATUS_CONFIG: Record<TaskStatus, { icon: typeof Circle; color: string; label: string }> = {
  PENDING: { icon: Circle, color: "text-muted-foreground", label: "Pendiente" },
  IN_PROGRESS: { icon: Clock, color: "text-blue-500", label: "En Progreso" },
  COMPLETED: { icon: CheckCircle2, color: "text-green-500", label: "Completada" },
};

export function JobTasks({ jobId }: { jobId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  const utils = trpc.useUtils();
  const { data: tasks = [], isLoading } = trpc.jobTask.list.useQuery({ jobId });

  const createTask = trpc.jobTask.create.useMutation({
    onSuccess: () => {
      utils.jobTask.list.invalidate({ jobId });
      setNewTitle("");
      setNewDueDate("");
      setShowForm(false);
    },
  });

  const toggleStatus = trpc.jobTask.toggleStatus.useMutation({
    onSuccess: () => {
      utils.jobTask.list.invalidate({ jobId });
    },
  });

  const removeTask = trpc.jobTask.remove.useMutation({
    onSuccess: () => {
      utils.jobTask.list.invalidate({ jobId });
    },
  });

  const completed = tasks.filter((t) => t.status === "COMPLETED").length;
  const total = tasks.length;
  const progressPct = total > 0 ? (completed / total) * 100 : 0;

  const handleCreate = () => {
    if (!newTitle.trim()) return;
    createTask.mutate({
      jobId,
      title: newTitle.trim(),
      dueDate: newDueDate ? new Date(newDueDate) : undefined,
    });
  };

  const isOverdue = (dueDate: Date | string | null, status: string) => {
    if (!dueDate || status === "COMPLETED") return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ListChecks className="h-5 w-5" />
          Tareas
          {total > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              {completed}/{total} completadas
            </span>
          )}
        </CardTitle>
        {!showForm && (
          <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Agregar
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Progress bar */}
        {total > 0 && (
          <div className="space-y-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-green-500 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(progressPct)}%
            </p>
          </div>
        )}

        {/* Task list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground py-2">
            Sin tareas. Agrega tareas para organizar el trabajo.
          </p>
        ) : (
          <ul className="space-y-1">
            {tasks.map((task) => {
              const config = STATUS_CONFIG[task.status as TaskStatus];
              const StatusIcon = config.icon;
              const overdue = isOverdue(task.dueDate, task.status);

              return (
                <li
                  key={task.id}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50 group"
                >
                  <button
                    type="button"
                    onClick={() => toggleStatus.mutate({ taskId: task.id })}
                    disabled={toggleStatus.isPending}
                    className="shrink-0"
                  >
                    <StatusIcon className={`h-5 w-5 ${config.color}`} />
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      task.status === "COMPLETED"
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span
                      className={`text-xs ${
                        overdue ? "text-red-500 font-medium" : "text-muted-foreground"
                      }`}
                    >
                      {overdue && <AlertCircle className="mr-0.5 inline h-3 w-3" />}
                      {new Date(task.dueDate).toLocaleDateString("es-PR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeTask.mutate({ taskId: task.id })}
                    disabled={removeTask.isPending}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Inline form */}
        {showForm && (
          <div className="flex items-end gap-2 pt-2 border-t">
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nombre de la tarea..."
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") setShowForm(false);
                }}
                autoFocus
              />
            </div>
            <input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            />
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={!newTitle.trim() || createTask.isPending}
            >
              {createTask.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Agregar"
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setNewTitle("");
                setNewDueDate("");
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
