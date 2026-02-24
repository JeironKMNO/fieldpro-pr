"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@fieldpro/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@fieldpro/ui/components/dialog";
import { Plus, Trash2, DollarSign, Loader2, Target } from "lucide-react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

const expenseCategories = [
  { value: "EQUIPMENT", label: "Equipo" },
  { value: "SUBCONTRACTOR", label: "Subcontratista" },
  { value: "PERMITS", label: "Permisos" },
  { value: "MATERIAL", label: "Materiales" },
  { value: "LABOR", label: "Mano de Obra" },
  { value: "OTHER", label: "Otros" },
] as const;

export function JobExpenses({
  jobId,
  jobValue,
}: {
  jobId: string;
  jobValue: number;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [category, setCategory] =
    useState<(typeof expenseCategories)[number]["value"]>("MATERIAL");
  const [vendor, setVendor] = useState("");

  const utils = trpc.useUtils();
  const { data: expenses, isLoading } = trpc.expense.byJobId.useQuery({
    jobId,
  });

  const createStatus = trpc.expense.create.useMutation({
    onSuccess: () => {
      utils.expense.byJobId.invalidate({ jobId });
      setIsDialogOpen(false);
      setDescription("");
      setAmount("");
      setVendor("");
      setDate(new Date().toISOString().split("T")[0]);
    },
  });

  const deleteStatus = trpc.expense.delete.useMutation({
    onSuccess: () => {
      utils.expense.byJobId.invalidate({ jobId });
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    createStatus.mutate({
      jobId,
      description,
      amount: parseFloat(amount),
      date: new Date(date),
      category,
      vendor: vendor || undefined,
    });
  };

  const totalExpenses =
    expenses?.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0) ||
    0;

  const profit = jobValue - totalExpenses;
  const profitMargin = jobValue > 0 ? (profit / jobValue) * 100 : 0;

  return (
    <Card className="card-fieldpro">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Gastos y Ganancia
          </CardTitle>
          <CardDescription>
            Registra los gastos asociados a este trabajo para calcular la
            ganancia real.
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Gasto
        </Button>
      </CardHeader>

      {/* Margin and Profit Summary */}
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-stone-50 p-3">
            <div className="text-sm font-medium text-stone-500">
              Valor del Trabajo
            </div>
            <div className="mt-1 text-2xl font-bold">
              {formatCurrency(jobValue)}
            </div>
          </div>
          <div className="rounded-lg border bg-rose-50 p-3">
            <div className="text-sm font-medium text-rose-600">
              Total de Gastos
            </div>
            <div className="mt-1 text-2xl font-bold text-rose-700">
              {formatCurrency(totalExpenses)}
            </div>
          </div>
          <div className="rounded-lg border bg-emerald-50 p-3">
            <div className="text-sm font-medium text-emerald-600 flex justify-between items-center">
              <span>Ganancia Estimada</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${profitMargin >= 30 ? "bg-emerald-200" : profitMargin > 15 ? "bg-yellow-200 text-yellow-800" : "bg-red-200 text-red-800"}`}
              >
                {profitMargin.toFixed(1)}% Margen
              </span>
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-700">
              {formatCurrency(profit)}
            </div>
          </div>
        </div>

        {/* Expenses List */}
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : expenses?.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No se han registrado gastos para este trabajo.
            </p>
          </div>
        ) : (
          <div className="divide-y rounded-md border">
            {expenses?.map((expense: any) => {
              const catLabel =
                expenseCategories.find((c) => c.value === expense.category)
                  ?.label || expense.category;

              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{expense.description}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-medium">
                        {catLabel}
                      </span>
                      {expense.vendor && (
                        <span>Proveedor: {expense.vendor}</span>
                      )}
                      <span>
                        {new Date(expense.date).toLocaleDateString("es-PR")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-medium text-rose-600">
                      -{formatCurrency(Number(expense.amount))}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteStatus.mutate({ id: expense.id })}
                      disabled={deleteStatus.isPending}
                    >
                      {deleteStatus.isPending &&
                      deleteStatus.variables?.id === expense.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Gasto</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <input
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ej. Alquiler de digger..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto ($)</label>
                <input
                  required
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <input
                  required
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                >
                  {expenseCategories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Proveedor (Opcional)
                </label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ej. Home Depot"
                  value={vendor}
                  onChange={(e) => setVendor(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={createStatus.isPending}>
                {createStatus.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Gasto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
