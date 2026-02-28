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
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  User,
  MapPin,
  Save,
  Loader2,
  DollarSign,
  Plus,
  Trash2,
  Download,
  Briefcase,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import { generateInvoicePDF } from "./invoice-pdf";
import { SendInvoiceDialog } from "./send-invoice-dialog";

/* ─── helpers ─── */

function fmtCurrency(v: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(v);
}

function fmtDate(d: Date | string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-PR", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

interface StatusAction {
  label: string;
  status: InvoiceStatus | "PAID_ACTION";
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "outline" | "destructive";
}

function getActions(status: InvoiceStatus): StatusAction[] {
  switch (status) {
    case "DRAFT":
      return [
        {
          label: "Enviar Factura",
          status: "SENT",
          icon: Send,
          variant: "default",
        },
        {
          label: "Cancelar",
          status: "CANCELLED",
          icon: XCircle,
          variant: "destructive",
        },
      ];
    case "SENT":
    case "VIEWED":
    case "OVERDUE":
      return [
        {
          label: "Marcar Pagada",
          status: "PAID_ACTION",
          icon: CheckCircle2,
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

/* ─── component ─── */

export function InvoiceDetail({
  initialInvoice,
}: {
  initialInvoice: { id: string };
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState("");
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({
    description: "",
    quantity: "1",
    unitPrice: "0",
  });
  const [showSendDialog, setShowSendDialog] = useState(false);
  const utils = trpc.useUtils();
  const router = useRouter();

  const { data: invoice, isLoading } = trpc.invoice.byId.useQuery({
    id: initialInvoice.id,
  });

  const updateInvoice = trpc.invoice.update.useMutation({
    onSuccess: () => {
      utils.invoice.byId.invalidate({ id: initialInvoice.id });
      setEditingNotes(false);
    },
  });

  const updateStatus = trpc.invoice.updateStatus.useMutation({
    onSuccess: () => utils.invoice.byId.invalidate({ id: initialInvoice.id }),
  });

  const markPaid = trpc.invoice.markPaid.useMutation({
    onSuccess: () => utils.invoice.byId.invalidate({ id: initialInvoice.id }),
  });

  const addItem = trpc.invoice.addItem.useMutation({
    onSuccess: () => {
      utils.invoice.byId.invalidate({ id: initialInvoice.id });
      setAddingItem(false);
      setNewItem({ description: "", quantity: "1", unitPrice: "0" });
    },
  });

  const removeItem = trpc.invoice.removeItem.useMutation({
    onSuccess: () => utils.invoice.byId.invalidate({ id: initialInvoice.id }),
  });

  if (isLoading || !invoice) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
        <div className="h-64 w-full animate-pulse rounded-md bg-muted" />
      </div>
    );
  }

  const isDraft = invoice.status === "DRAFT";
  const actions = getActions(invoice.status as InvoiceStatus);
  const primaryAddress = invoice.client.addresses?.[0];
  const isOverdue =
    invoice.dueDate &&
    new Date(invoice.dueDate) < new Date() &&
    !["PAID", "CANCELLED"].includes(invoice.status);

  const handleAction = (action: StatusAction) => {
    if (action.status === "PAID_ACTION") {
      markPaid.mutate({ id: invoice.id });
    } else if (action.status === "SENT") {
      setShowSendDialog(true);
    } else {
      updateStatus.mutate({
        id: invoice.id,
        status: action.status as "SENT" | "CANCELLED",
      });
    }
  };

  const handleDownloadPDF = () => {
    generateInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      createdAt: invoice.createdAt,
      dueDate: invoice.dueDate,
      client: {
        name: invoice.client.name,
        email: invoice.client.email,
        phone: invoice.client.phone,
        address: primaryAddress
          ? `${primaryAddress.street}${primaryAddress.city ? `, ${primaryAddress.city}` : ""}${primaryAddress.zipCode ? ` ${primaryAddress.zipCode}` : ""}`
          : undefined,
      },
      organization: {
        name: invoice.organization.name,
        phone: invoice.organization.phone,
        license: invoice.organization.license,
        logoUrl: invoice.organization.logoUrl,
      },
      items: invoice.items.map((it) => ({
        description: it.description,
        quantity: Number(it.quantity),
        unitPrice: Number(it.unitPrice),
        total: Number(it.total),
      })),
      subtotal: Number(invoice.subtotal),
      taxRate: Number(invoice.taxRate),
      taxAmount: Number(invoice.taxAmount),
      total: Number(invoice.total),
      notes: invoice.notes,
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/invoices" className="shrink-0">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold">
                {invoice.invoiceNumber}
              </h1>
              <InvoiceStatusBadge status={invoice.status} />
              {isOverdue && (
                <span className="flex items-center gap-1 text-sm text-red-600 font-medium">
                  <AlertTriangle className="h-4 w-4" />
                  Vencida
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm truncate">
              {invoice.client.name}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:shrink-0">
          <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              size="sm"
              onClick={() => handleAction(action)}
              disabled={updateStatus.isPending || markPaid.isPending}
            >
              <action.icon className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* ── Main ── */}
        <div className="md:col-span-2 space-y-6">
          {/* Line items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Partidas</CardTitle>
              {isDraft && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingItem(true)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Agregar
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="pb-2 text-left font-medium">
                        Descripción
                      </th>
                      <th className="pb-2 text-right font-medium w-20">
                        Cant.
                      </th>
                      <th className="pb-2 text-right font-medium w-28">
                        Precio Unit.
                      </th>
                      <th className="pb-2 text-right font-medium w-28">
                        Total
                      </th>
                      {isDraft && <th className="pb-2 w-10" />}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.items.map((item) => (
                      <tr key={item.id} className="group">
                        <td className="py-2.5">{item.description}</td>
                        <td className="py-2.5 text-right text-muted-foreground">
                          {Number(item.quantity)}
                        </td>
                        <td className="py-2.5 text-right text-muted-foreground">
                          {fmtCurrency(Number(item.unitPrice))}
                        </td>
                        <td className="py-2.5 text-right font-medium">
                          {fmtCurrency(Number(item.total))}
                        </td>
                        {isDraft && (
                          <td className="py-2.5 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 h-7 w-7"
                              onClick={() => removeItem.mutate({ id: item.id })}
                              disabled={removeItem.isPending}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {addingItem && (
                      <tr>
                        <td className="py-2">
                          <input
                            type="text"
                            value={newItem.description}
                            onChange={(e) =>
                              setNewItem((p) => ({
                                ...p,
                                description: e.target.value,
                              }))
                            }
                            placeholder="Descripción del artículo"
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            autoFocus
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={newItem.quantity}
                            onChange={(e) =>
                              setNewItem((p) => ({
                                ...p,
                                quantity: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            min="0"
                            step="any"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="number"
                            value={newItem.unitPrice}
                            onChange={(e) =>
                              setNewItem((p) => ({
                                ...p,
                                unitPrice: e.target.value,
                              }))
                            }
                            className="w-full rounded border border-input bg-background px-2 py-1 text-sm text-right focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            min="0"
                            step="any"
                          />
                        </td>
                        <td className="py-2 text-right font-medium text-muted-foreground">
                          {fmtCurrency(
                            parseFloat(newItem.quantity || "0") *
                              parseFloat(newItem.unitPrice || "0")
                          )}
                        </td>
                        <td className="py-2 text-right">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => {
                                if (!newItem.description.trim()) return;
                                addItem.mutate({
                                  invoiceId: invoice.id,
                                  description: newItem.description,
                                  quantity: parseFloat(newItem.quantity) || 1,
                                  unitPrice: parseFloat(newItem.unitPrice) || 0,
                                });
                              }}
                              disabled={addItem.isPending}
                            >
                              {addItem.isPending ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Save className="h-3.5 w-3.5 text-green-600" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => setAddingItem(false)}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="mt-4 border-t pt-4 space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{fmtCurrency(Number(invoice.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    IVU ({(Number(invoice.taxRate) * 100).toFixed(1)}%)
                  </span>
                  <span>{fmtCurrency(Number(invoice.taxAmount))}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t pt-2">
                  <span>Total</span>
                  <span>{fmtCurrency(Number(invoice.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notas</CardTitle>
              {isDraft && !editingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNotes(invoice.notes ?? "");
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
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Agregar notas..."
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        updateInvoice.mutate({ id: invoice.id, notes })
                      }
                      disabled={updateInvoice.isPending}
                    >
                      {updateInvoice.isPending ? (
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
                  {invoice.notes || "Sin notas."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Related Job / Quote */}
          {invoice.job && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Trabajo Relacionado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{invoice.job.jobNumber}</p>
                    {invoice.job.quote && (
                      <p className="text-sm text-muted-foreground">
                        Cotización: {invoice.job.quote.quoteNumber}
                      </p>
                    )}
                  </div>
                  <Link href={`/jobs/${invoice.job.id}`}>
                    <Button variant="outline" size="sm">
                      Ver Trabajo
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Timeline */}
          {invoice.activities && invoice.activities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invoice.activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${
                          activity.type === "PAID"
                            ? "bg-green-500"
                            : activity.type === "SENT"
                              ? "bg-blue-500"
                              : activity.type === "CANCELLED"
                                ? "bg-red-500"
                                : "bg-gray-400"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium capitalize">
                          {activity.type.toLowerCase().replace(/_/g, " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fmtDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium">{invoice.client.name}</p>
                {invoice.client.email && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.client.email}
                  </p>
                )}
                {invoice.client.phone && (
                  <p className="text-sm text-muted-foreground">
                    {invoice.client.phone}
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
              <Link href={`/clients/${invoice.client.id}`}>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  Ver Cliente
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Dates + Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Detalles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Creada</p>
                <p className="text-sm font-medium">
                  {fmtDate(invoice.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Fecha de Vencimiento
                </p>
                <p
                  className={`text-sm font-medium ${isOverdue ? "text-red-600" : ""}`}
                >
                  {fmtDate(invoice.dueDate)}
                </p>
              </div>
              {invoice.sentAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Enviada</p>
                  <p className="text-sm font-medium">
                    {fmtDate(invoice.sentAt)}
                  </p>
                </div>
              )}
              {invoice.paidAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Pagada</p>
                  <p className="text-sm font-medium text-green-600">
                    {fmtDate(invoice.paidAt)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Creada por</p>
                <p className="text-sm font-medium">
                  <User className="mr-1 inline h-3.5 w-3.5" />
                  {invoice.createdBy.firstName} {invoice.createdBy.lastName}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Share link */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Compartir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">
                Comparte este enlace con tu cliente para ver la factura en
                línea.
              </p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`${typeof window !== "undefined" ? window.location.origin : ""}/invoices/share/${invoice.shareToken}`}
                  className="flex-1 rounded-md border border-input bg-muted px-2 py-1 text-xs truncate"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/invoices/share/${invoice.shareToken}`
                    );
                  }}
                >
                  Copiar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showSendDialog && (
        <SendInvoiceDialog
          invoiceId={invoice.id}
          invoiceNumber={invoice.invoiceNumber}
          clientEmail={invoice.client.email ?? ""}
          clientName={invoice.client.name}
          total={fmtCurrency(Number(invoice.total))}
          onClose={() => setShowSendDialog(false)}
          onSent={() => {
            setShowSendDialog(false);
            utils.invoice.byId.invalidate({ id: initialInvoice.id });
          }}
        />
      )}
    </div>
  );
}
