"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@fieldpro/ui/components/card";
import { Badge } from "@fieldpro/ui/components/badge";
import { InvoiceStatusBadge } from "./invoice-status-badge";
import {
    Calendar,
    User,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Building2,
} from "lucide-react";

function fmtCurrency(v: number) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(v);
}

function fmtDate(d: Date | string | null) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-PR", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

interface PublicInvoiceViewProps {
    invoice: {
        invoiceNumber: string;
        status: string;
        createdAt: Date;
        dueDate: Date | null;
        subtotal: unknown;
        taxRate: unknown;
        taxAmount: unknown;
        total: unknown;
        notes: string | null;
        paidAt: Date | null;
        organization: {
            name: string;
            phone: string | null;
            license: string | null;
            logoUrl: string | null;
        };
        client: {
            name: string;
            email: string | null;
            phone: string | null;
            addresses: { street: string; city: string | null; zipCode: string | null }[];
        };
        items: {
            id: string;
            description: string;
            quantity: unknown;
            unitPrice: unknown;
            total: unknown;
        }[];
    };
    isOverdue: boolean;
}

export function PublicInvoiceView({ invoice, isOverdue }: PublicInvoiceViewProps) {
    const primaryAddress = invoice.client.addresses?.[0];
    const isPaid = invoice.status === "PAID";
    const isCancelled = invoice.status === "CANCELLED";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold">{invoice.organization.name}</h1>
                    </div>
                    {invoice.organization.phone && (
                        <p className="text-sm text-muted-foreground mt-1">{invoice.organization.phone}</p>
                    )}
                    {invoice.organization.license && (
                        <p className="text-xs text-muted-foreground">Lic: {invoice.organization.license}</p>
                    )}
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">FACTURA</h2>
                    <p className="text-lg text-muted-foreground">{invoice.invoiceNumber}</p>
                    <div className="mt-1">
                        <InvoiceStatusBadge status={invoice.status} />
                    </div>
                </div>
            </div>

            {/* Overdue / Paid banner */}
            {isOverdue && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    <span className="font-medium">Esta factura está vencida. Por favor realice el pago lo antes posible.</span>
                </div>
            )}
            {isPaid && (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">
                        Pago recibido{invoice.paidAt ? ` el ${fmtDate(invoice.paidAt)}` : ""}. ¡Gracias!
                    </span>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main */}
                <div className="md:col-span-2 space-y-6">
                    {/* Line Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Partidas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-muted-foreground">
                                        <th className="pb-2 text-left font-medium">Descripción</th>
                                        <th className="pb-2 text-right font-medium w-16">Cant.</th>
                                        <th className="pb-2 text-right font-medium w-28">Precio</th>
                                        <th className="pb-2 text-right font-medium w-28">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {invoice.items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-2.5">{item.description}</td>
                                            <td className="py-2.5 text-right text-muted-foreground">{Number(item.quantity)}</td>
                                            <td className="py-2.5 text-right text-muted-foreground">{fmtCurrency(Number(item.unitPrice))}</td>
                                            <td className="py-2.5 text-right font-medium">{fmtCurrency(Number(item.total))}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {/* Totals */}
                            <div className="mt-4 border-t pt-4 space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{fmtCurrency(Number(invoice.subtotal))}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">IVU ({(Number(invoice.taxRate) * 100).toFixed(1)}%)</span>
                                    <span>{fmtCurrency(Number(invoice.taxAmount))}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold border-t pt-2">
                                    <span>Total</span>
                                    <span className={isPaid ? "text-green-600" : ""}>{fmtCurrency(Number(invoice.total))}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {invoice.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Facturado A
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="font-medium">{invoice.client.name}</p>
                            {invoice.client.email && <p className="text-sm text-muted-foreground">{invoice.client.email}</p>}
                            {invoice.client.phone && <p className="text-sm text-muted-foreground">{invoice.client.phone}</p>}
                            {primaryAddress && (
                                <p className="text-sm text-muted-foreground flex items-start gap-1">
                                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                                    {primaryAddress.street}
                                    {primaryAddress.city && `, ${primaryAddress.city}`}
                                    {primaryAddress.zipCode && ` ${primaryAddress.zipCode}`}
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Fechas
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha de Factura</p>
                                <p className="text-sm font-medium">{fmtDate(invoice.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                                <p className={`text-sm font-medium ${isOverdue ? "text-red-600" : ""}`}>
                                    {fmtDate(invoice.dueDate)}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
