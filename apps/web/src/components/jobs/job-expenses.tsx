"use client";

import { useRef, useState, useEffect } from "react";
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
import {
  Plus,
  Trash2,
  DollarSign,
  Loader2,
  Camera,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  MinusCircle,
  Pencil,
  Check,
  X,
} from "lucide-react";

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

type ExpenseCategoryValue = (typeof expenseCategories)[number]["value"];

interface SuggestedExpense {
  description: string;
  amount: number;
  date: string;
  category: string;
  vendor: string;
}

function BudgetRow({
  label,
  budget,
  spent,
}: {
  label: string;
  budget: number;
  spent: number;
}) {
  const diff = budget - spent;
  const overBudget = diff < 0;
  return (
    <div className="grid grid-cols-4 gap-2 text-sm py-1.5 border-b last:border-0">
      <span className="text-slate-600 font-medium">{label}</span>
      <span className="text-right tabular-nums">{formatCurrency(budget)}</span>
      <span className="text-right tabular-nums text-rose-600">
        {formatCurrency(spent)}
      </span>
      <span
        className={`text-right tabular-nums font-medium ${overBudget ? "text-red-600" : "text-emerald-600"}`}
      >
        {overBudget ? "-" : "+"}
        {formatCurrency(Math.abs(diff))}
      </span>
    </div>
  );
}

function ClosureSummary({
  jobValue,
  totalExpenses,
}: {
  jobValue: number;
  totalExpenses: number;
}) {
  const grossProfit = jobValue - totalExpenses;
  const margin = jobValue > 0 ? (grossProfit / jobValue) * 100 : 0;
  const status =
    grossProfit > 0 ? "PROFITABLE" : grossProfit === 0 ? "BREAK_EVEN" : "LOSS";

  const statusConfig = {
    PROFITABLE: {
      label: "Rentable",
      icon: CheckCircle2,
      className: "bg-emerald-50 border-emerald-200 text-emerald-700",
      badgeClass: "bg-emerald-100 text-emerald-800",
    },
    BREAK_EVEN: {
      label: "Punto de Equilibrio",
      icon: MinusCircle,
      className: "bg-amber-50 border-amber-200 text-amber-700",
      badgeClass: "bg-amber-100 text-amber-800",
    },
    LOSS: {
      label: "Pérdida",
      icon: AlertTriangle,
      className: "bg-red-50 border-red-200 text-red-700",
      badgeClass: "bg-red-100 text-red-800",
    },
  }[status];

  const Icon = statusConfig.icon;

  return (
    <div className={`rounded-lg border p-4 ${statusConfig.className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <TrendingUp className="h-4 w-4" />
          RESUMEN FINAL DEL PROYECTO
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${statusConfig.badgeClass}`}
        >
          <Icon className="h-3 w-3" />
          {statusConfig.label}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-xs opacity-70">Valor Cotizado</p>
          <p className="font-bold text-lg tabular-nums">
            {formatCurrency(jobValue)}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-70">Total Gastos</p>
          <p className="font-bold text-lg tabular-nums">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-70">Ganancia Bruta</p>
          <p className="font-bold text-lg tabular-nums">
            {formatCurrency(grossProfit)}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-70">Margen</p>
          <p className="font-bold text-lg tabular-nums">{margin.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

export function JobExpenses({
  jobId,
  jobValue,
  jobStatus,
  materialBudget,
  operationalBudget,
}: {
  jobId: string;
  jobValue: number;
  jobStatus?: string;
  materialBudget?: number;
  operationalBudget?: number;
}) {
  const matBudget = materialBudget ?? 0;
  const opsBudget = operationalBudget ?? 0;
  const hasBudget = matBudget > 0 || opsBudget > 0;

  // Manual expense dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [category, setCategory] = useState<ExpenseCategoryValue>("MATERIAL");
  const [vendor, setVendor] = useState("");

  // AI receipt scanner state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [scanDescription, setScanDescription] = useState("");
  const [scanAmount, setScanAmount] = useState("");
  const [scanDate, setScanDate] = useState("");
  const [scanCategory, setScanCategory] =
    useState<ExpenseCategoryValue>("MATERIAL");
  const [scanVendor, setScanVendor] = useState("");

  // Budget form state
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetMat, setBudgetMat] = useState(String(matBudget || ""));
  const [budgetOps, setBudgetOps] = useState(String(opsBudget || ""));

  // Inline value edit state
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editValue, setEditValue] = useState(String(jobValue || ""));
  const valueInputRef = useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const { data: expenses, isLoading } = trpc.expense.byJobId.useQuery({
    jobId,
  });

  const createMutation = trpc.expense.create.useMutation({
    onSuccess: () => {
      utils.expense.byJobId.invalidate({ jobId });
      setIsDialogOpen(false);
      setIsConfirmOpen(false);

      setDescription("");
      setAmount("");
      setVendor("");
      setDate(new Date().toISOString().split("T")[0]);
    },
  });

  const deleteMutation = trpc.expense.delete.useMutation({
    onSuccess: () => {
      utils.expense.byJobId.invalidate({ jobId });
    },
  });

  const setBudgetMutation = trpc.job.setBudget.useMutation({
    onSuccess: () => {
      utils.job.byId.invalidate();
      setShowBudgetForm(false);
    },
  });

  const updateValueMutation = trpc.job.updateValue.useMutation({
    onSuccess: () => {
      utils.job.byId.invalidate();
      setIsEditingValue(false);
    },
  });

  useEffect(() => {
    if (isEditingValue && valueInputRef.current) {
      valueInputRef.current.focus();
      valueInputRef.current.select();
    }
  }, [isEditingValue]);

  // Totals
  const totalExpenses =
    expenses?.reduce((sum, exp) => sum + Number(exp.amount), 0) ?? 0;
  const materialSpent =
    expenses
      ?.filter((e) => e.category === "MATERIAL")
      .reduce((sum, e) => sum + Number(e.amount), 0) ?? 0;
  const operationalSpent = totalExpenses - materialSpent;

  const profit = jobValue - totalExpenses;
  const profitMargin = jobValue > 0 ? (profit / jobValue) * 100 : 0;

  // Manual expense form
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    createMutation.mutate({
      jobId,
      description,
      amount: parseFloat(amount),
      date: new Date(date + "T12:00:00"),
      category,
      vendor: vendor || undefined,
    });
  };

  // AI Receipt scanner
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("jobId", jobId);

      const res = await fetch("/api/ai/receipt", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al procesar el recibo");
      const data = (await res.json()) as {
        suggested_expense: SuggestedExpense;
      };

      const suggested = data.suggested_expense;
      setScanDescription(suggested.description);
      setScanAmount(String(suggested.amount));
      setScanDate(suggested.date);
      setScanCategory(
        (expenseCategories.find((c) => c.value === suggested.category)?.value ??
          "OTHER") as ExpenseCategoryValue
      );
      setScanVendor(suggested.vendor);
      setIsConfirmOpen(true);
    } catch (err) {
      console.error(err);
      alert("No se pudo procesar el recibo. Intenta de nuevo.");
    } finally {
      setIsScanning(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmScan = () => {
    if (!scanAmount) return;
    createMutation.mutate({
      jobId,
      description: scanDescription,
      amount: parseFloat(scanAmount),
      date: new Date(scanDate + "T12:00:00"),
      category: scanCategory,
      vendor: scanVendor || undefined,
    });
  };

  const handleSetBudget = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgetMutation.mutate({
      jobId,
      materialBudget: parseFloat(budgetMat) || 0,
      operationalBudget: parseFloat(budgetOps) || 0,
    });
  };

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
        <div className="flex items-center gap-2">
          {/* Hidden file input for camera/image */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            title="Escanear recibo con IA"
          >
            {isScanning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Camera className="mr-2 h-4 w-4" />
            )}
            {isScanning ? "Procesando..." : "Escanear Recibo"}
          </Button>
          <Button size="sm" onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Gasto
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* MODO 2: Closure Summary (only when COMPLETED) */}
        {jobStatus === "COMPLETED" && (
          <ClosureSummary jobValue={jobValue} totalExpenses={totalExpenses} />
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-stone-50 p-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-stone-500">
                Valor del Trabajo
              </div>
              {!isEditingValue && (
                <button
                  onClick={() => {
                    setEditValue(String(jobValue));
                    setIsEditingValue(true);
                  }}
                  className="text-stone-400 hover:text-stone-600 transition-colors"
                  title="Editar valor"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {isEditingValue ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const parsed = parseFloat(editValue);
                  if (!isNaN(parsed) && parsed >= 0) {
                    updateValueMutation.mutate({ jobId, value: parsed });
                  }
                }}
                className="mt-1 flex items-center gap-1"
              >
                <span className="text-stone-500 font-bold">$</span>
                <input
                  ref={valueInputRef}
                  type="number"
                  min="0"
                  step="0.01"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setIsEditingValue(false);
                    }
                  }}
                  className="w-full rounded border border-stone-300 bg-white px-2 py-0.5 text-xl font-bold focus:border-stone-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={updateValueMutation.isPending}
                  className="text-emerald-600 hover:text-emerald-700"
                  title="Guardar"
                >
                  {updateValueMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingValue(false)}
                  className="text-stone-400 hover:text-stone-600"
                  title="Cancelar"
                >
                  <X className="h-4 w-4" />
                </button>
              </form>
            ) : (
              <div
                className="mt-1 text-2xl font-bold cursor-pointer hover:text-stone-600 transition-colors"
                onClick={() => {
                  setEditValue(String(jobValue));
                  setIsEditingValue(true);
                }}
                title="Haz clic para editar"
              >
                {formatCurrency(jobValue)}
              </div>
            )}
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
                className={`text-xs px-2 py-0.5 rounded-full ${
                  profitMargin >= 30
                    ? "bg-emerald-200"
                    : profitMargin > 15
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-red-200 text-red-800"
                }`}
              >
                {profitMargin.toFixed(1)}% Margen
              </span>
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-700">
              {formatCurrency(profit)}
            </div>
          </div>
        </div>

        {/* Budget Breakdown */}
        {hasBudget ? (
          <div className="rounded-lg border bg-slate-50 p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-slate-700">
                Presupuesto vs Real
              </h4>
              <button
                onClick={() => {
                  setBudgetMat(String(matBudget));
                  setBudgetOps(String(opsBudget));
                  setShowBudgetForm(true);
                }}
                className="text-xs text-slate-500 hover:text-slate-700 underline"
              >
                Editar
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-slate-500 pb-1 border-b">
              <span>Tipo</span>
              <span className="text-right">Presupuesto</span>
              <span className="text-right">Gastado</span>
              <span className="text-right">Diferencia</span>
            </div>
            <BudgetRow
              label="Materiales"
              budget={matBudget}
              spent={materialSpent}
            />
            <BudgetRow
              label="Operacional"
              budget={opsBudget}
              spent={operationalSpent}
            />
          </div>
        ) : !showBudgetForm ? (
          <div className="text-center">
            <button
              onClick={() => setShowBudgetForm(true)}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              + Establecer presupuesto del proyecto
            </button>
          </div>
        ) : null}

        {/* Budget Setup Form */}
        {showBudgetForm && (
          <form
            onSubmit={handleSetBudget}
            className="rounded-lg border bg-slate-50 p-4 space-y-3"
          >
            <h4 className="text-sm font-semibold text-slate-700">
              Establecer Presupuesto
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Presupuesto Materiales ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  placeholder="0.00"
                  value={budgetMat}
                  onChange={(e) => setBudgetMat(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Presupuesto Operacional ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  placeholder="0.00"
                  value={budgetOps}
                  onChange={(e) => setBudgetOps(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setShowBudgetForm(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={setBudgetMutation.isPending}
              >
                {setBudgetMutation.isPending && (
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Guardar Presupuesto
              </Button>
            </div>
          </form>
        )}

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
            {expenses?.map((expense) => {
              const catLabel =
                expenseCategories.find((c) => c.value === expense.category)
                  ?.label ?? expense.category;

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
                      onClick={() => deleteMutation.mutate({ id: expense.id })}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending &&
                      deleteMutation.variables?.id === expense.id ? (
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

      {/* Manual Add Dialog */}
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
                  onChange={(e) =>
                    setCategory(e.target.value as ExpenseCategoryValue)
                  }
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Guardar Gasto
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Scan Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-violet-600" />
              Recibo Escaneado por IA
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 -mt-2">
            Verifica y ajusta los datos extraídos antes de guardar.
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Descripción</label>
              <input
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={scanDescription}
                onChange={(e) => setScanDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Monto ($)</label>
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={scanAmount}
                  onChange={(e) => setScanAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha</label>
                <input
                  type="date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={scanDate}
                  onChange={(e) => setScanDate(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Categoría</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={scanCategory}
                  onChange={(e) =>
                    setScanCategory(e.target.value as ExpenseCategoryValue)
                  }
                >
                  {expenseCategories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Proveedor</label>
                <input
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={scanVendor}
                  onChange={(e) => setScanVendor(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmScan}
              disabled={createMutation.isPending}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Guardar Gasto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
