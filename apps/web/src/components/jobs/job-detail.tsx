"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import {
  ArrowLeft,
  Calendar,
  Play,
  CheckCircle2,
  Pause,
  XCircle,
  RotateCcw,
  FileText,
  User,
  MapPin,
  Save,
  Loader2,
  Receipt,
  DollarSign,
} from "lucide-react";
import { JobStatusBadge } from "./job-status-badge";
import { JobTasks } from "./job-tasks";
import { ChangeOrders } from "./change-orders";
import { MaterialShoppingList } from "./material-shopping-list";
import { JobExpenses } from "./job-expenses";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatDate(date: Date | string | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-PR", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type JobStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

interface StatusAction {
  label: string;
  status: JobStatus;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "outline" | "destructive";
}

function getStatusActions(currentStatus: JobStatus): StatusAction[] {
  switch (currentStatus) {
    case "SCHEDULED":
      return [
        {
          label: "Iniciar Trabajo",
          status: "IN_PROGRESS",
          icon: Play,
          variant: "default",
        },
        {
          label: "Cancelar",
          status: "CANCELLED",
          icon: XCircle,
          variant: "destructive",
        },
      ];
    case "IN_PROGRESS":
      return [
        {
          label: "Completar",
          status: "COMPLETED",
          icon: CheckCircle2,
          variant: "default",
        },
        {
          label: "En Espera",
          status: "ON_HOLD",
          icon: Pause,
          variant: "outline",
        },
        {
          label: "Cancelar",
          status: "CANCELLED",
          icon: XCircle,
          variant: "destructive",
        },
      ];
    case "ON_HOLD":
      return [
        {
          label: "Reanudar",
          status: "IN_PROGRESS",
          icon: RotateCcw,
          variant: "default",
        },
        {
          label: "Cancelar",
          status: "CANCELLED",
          icon: XCircle,
          variant: "destructive",
        },
      ];
    default:
      return [];
  }
}

export function JobDetail({ initialJob }: { initialJob: { id: string } }) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [title, setTitle] = useState("");
  const utils = trpc.useUtils();
  const router = useRouter();

  const { data: job, isLoading } = trpc.job.byId.useQuery({
    id: initialJob.id,
  });

  const updateStatus = trpc.job.updateStatus.useMutation({
    onSuccess: () => {
      utils.job.byId.invalidate({ id: initialJob.id });
    },
  });

  const update = trpc.job.update.useMutation({
    onSuccess: () => {
      utils.job.byId.invalidate({ id: initialJob.id });
      setEditingNotes(false);
      setEditingTitle(false);
    },
  });

  const createInvoice = trpc.invoice.createFromJob.useMutation({
    onSuccess: (invoice) => {
      router.push(`/invoices/${invoice.id}`);
    },
  });

  if (isLoading || !job) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  const isEditable = job.status !== "COMPLETED" && job.status !== "CANCELLED";
  const actions = getStatusActions(job.status as JobStatus);
  const primaryAddress = job.client.addresses?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/jobs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-3xl font-bold">
                {job.jobNumber}
              </h1>
              <JobStatusBadge status={job.status} />
            </div>
            <p className="text-muted-foreground">
              {job.client.name}
              {job.title && ` — ${job.title}`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.status}
              variant={action.variant}
              size="sm"
              onClick={() =>
                updateStatus.mutate({ id: job.id, status: action.status })
              }
              disabled={updateStatus.isPending}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-6">
          {/* Job Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Trabajo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Title */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Título</p>
                  {editingTitle ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <Button
                        size="sm"
                        onClick={() => update.mutate({ id: job.id, title })}
                        disabled={update.isPending}
                      >
                        {update.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingTitle(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <p
                      className={`text-sm font-medium ${isEditable ? "cursor-pointer hover:text-primary" : ""}`}
                      onClick={() => {
                        if (!isEditable) return;
                        setTitle(job.title ?? "");
                        setEditingTitle(true);
                      }}
                    >
                      {job.title || "Sin título"}
                    </p>
                  )}
                </div>
              </div>

              {/* Value */}
              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(Number(job.value))}
                </p>
              </div>

              {/* Dates */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Programado</p>
                  <p className="text-sm font-medium">
                    <Calendar className="mr-1 inline h-3.5 w-3.5" />
                    {formatDate(job.scheduledDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Iniciado</p>
                  <p className="text-sm font-medium">
                    {formatDate(job.startedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completado</p>
                  <p className="text-sm font-medium">
                    {formatDate(job.completedAt)}
                  </p>
                </div>
              </div>

              {/* Created By */}
              <div>
                <p className="text-sm text-muted-foreground">Creado por</p>
                <p className="text-sm font-medium">
                  <User className="mr-1 inline h-3.5 w-3.5" />
                  {job.createdBy.firstName} {job.createdBy.lastName}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notes Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notas</CardTitle>
              {isEditable && !editingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNotes(job.notes ?? "");
                    setEditingNotes(true);
                  }}
                >
                  Editar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {editingNotes ? (
                <div className="space-y-3">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Agregar notas sobre este trabajo..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => update.mutate({ id: job.id, notes })}
                      disabled={update.isPending}
                    >
                      {update.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Guardar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingNotes(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {job.notes || "Aún sin notas."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tareas */}
          <JobTasks jobId={job.id} />

          {/* Gastos y Ganancia */}
          <JobExpenses
            jobId={job.id}
            jobValue={Number(job.value)}
            jobStatus={job.status}
            materialBudget={Number(
              (job as { materialBudget?: unknown }).materialBudget ?? 0
            )}
            operationalBudget={Number(
              (job as { operationalBudget?: unknown }).operationalBudget ?? 0
            )}
          />

          {/* Órdenes de Cambio */}
          <ChangeOrders jobId={job.id} jobValue={Number(job.value)} />

          {/* Material Shopping List */}
          <MaterialShoppingList jobId={job.id} hasQuote={!!job.quote} />

          {/* Quote Link */}
          {job.quote && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Cotización Original
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{job.quote.quoteNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(Number(job.quote.total))}
                    </p>
                  </div>
                  <Link href={`/quotes/${job.quote.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Cotización
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Invoice Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Factura
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.invoice ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {job.invoice.invoiceNumber || "Factura"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Creada desde este trabajo
                    </p>
                  </div>
                  <Link href={`/invoices/${job.invoice.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Factura
                    </Button>
                  </Link>
                </div>
              ) : job.status === "COMPLETED" ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Este trabajo está completado. Crea una factura para cobrar
                    al cliente.
                  </p>
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    onClick={() => createInvoice.mutate({ jobId: job.id })}
                    disabled={createInvoice.isPending}
                  >
                    {createInvoice.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Crear Factura
                      </>
                    )}
                  </Button>
                  {createInvoice.isError && (
                    <p className="text-sm text-destructive">
                      {createInvoice.error.message}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Completa este trabajo para crear una factura.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Client Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{job.client.name}</p>
                {job.client.email && (
                  <p className="text-sm text-muted-foreground">
                    {job.client.email}
                  </p>
                )}
                {job.client.phone && (
                  <p className="text-sm text-muted-foreground">
                    {job.client.phone}
                  </p>
                )}
              </div>
              {primaryAddress && (
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    Dirección
                  </p>
                  <p className="text-sm">
                    {primaryAddress.street}
                    {primaryAddress.city && `, ${primaryAddress.city}`}
                    {primaryAddress.zipCode && ` ${primaryAddress.zipCode}`}
                  </p>
                </div>
              )}
              <Link href={`/clients/${job.client.id}`}>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Ver Cliente
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
