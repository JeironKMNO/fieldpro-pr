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
import { FilePenLine, Plus, X, Loader2, Check, Ban } from "lucide-react";

type ChangeOrderStatus = "PENDING" | "APPROVED" | "REJECTED";

const STATUS_BADGES: Record<ChangeOrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Aprobado", className: "bg-green-100 text-green-800" },
  REJECTED: { label: "Rechazado", className: "bg-red-100 text-red-800" },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    signDisplay: "auto",
  }).format(value);
}

export function ChangeOrders({
  jobId,
  jobValue,
}: {
  jobId: string;
  jobValue: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const utils = trpc.useUtils();
  const { data: orders = [], isLoading } = trpc.changeOrder.list.useQuery({ jobId });

  const createOrder = trpc.changeOrder.create.useMutation({
    onSuccess: () => {
      utils.changeOrder.list.invalidate({ jobId });
      setNewTitle("");
      setNewDescription("");
      setNewAmount("");
      setShowForm(false);
    },
  });

  const updateOrder = trpc.changeOrder.update.useMutation({
    onSuccess: () => {
      utils.changeOrder.list.invalidate({ jobId });
      utils.job.byId.invalidate();
    },
  });

  const removeOrder = trpc.changeOrder.remove.useMutation({
    onSuccess: () => {
      utils.changeOrder.list.invalidate({ jobId });
    },
  });

  const approvedTotal = orders
    .filter((o) => o.status === "APPROVED")
    .reduce((sum, o) => sum + Number(o.amount), 0);

  const handleCreate = () => {
    const amount = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(amount)) return;
    createOrder.mutate({
      jobId,
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      amount,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FilePenLine className="h-5 w-5" />
          Órdenes de Cambio
        </CardTitle>
        {!showForm && (
          <Button variant="ghost" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Nuevo Cambio
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 && !showForm ? (
          <p className="text-sm text-muted-foreground py-2">
            Sin cambios al alcance original.
          </p>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => {
              const badge = STATUS_BADGES[order.status as ChangeOrderStatus];
              const isPending = order.status === "PENDING";

              return (
                <li
                  key={order.id}
                  className="rounded-md border p-3 space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{order.title}</p>
                      {order.description && (
                        <p className="text-xs text-muted-foreground">
                          {order.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold ${
                          Number(order.amount) >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {Number(order.amount) >= 0 ? "+" : ""}
                        {formatCurrency(Number(order.amount))}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    </div>
                  </div>

                  {isPending && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() =>
                          updateOrder.mutate({ orderId: order.id, status: "APPROVED" })
                        }
                        disabled={updateOrder.isPending}
                      >
                        <Check className="mr-1 h-3.5 w-3.5" />
                        Aprobar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() =>
                          updateOrder.mutate({ orderId: order.id, status: "REJECTED" })
                        }
                        disabled={updateOrder.isPending}
                      >
                        <Ban className="mr-1 h-3.5 w-3.5" />
                        Rechazar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="ml-auto text-muted-foreground hover:text-destructive"
                        onClick={() => removeOrder.mutate({ orderId: order.id })}
                        disabled={removeOrder.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {/* Approved total */}
        {orders.length > 0 && (
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm text-muted-foreground">
              Total cambios aprobados
            </span>
            <span
              className={`text-sm font-semibold ${
                approvedTotal >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {approvedTotal >= 0 ? "+" : ""}
              {formatCurrency(approvedTotal)}
            </span>
          </div>
        )}

        {/* Inline form */}
        {showForm && (
          <div className="space-y-2 border-t pt-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Descripción del cambio..."
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              autoFocus
            />
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Detalles adicionales (opcional)..."
              rows={2}
              className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground">
                  Monto (+ cargo, - crédito)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreate();
                    if (e.key === "Escape") setShowForm(false);
                  }}
                />
              </div>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newTitle.trim() || !newAmount || createOrder.isPending}
              >
                {createOrder.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Crear"
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setNewTitle("");
                  setNewDescription("");
                  setNewAmount("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
