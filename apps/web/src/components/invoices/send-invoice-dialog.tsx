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
import { Send, X, Loader2, Mail } from "lucide-react";

interface SendInvoiceDialogProps {
    invoiceId: string;
    invoiceNumber: string;
    clientEmail: string;
    clientName: string;
    total: string;
    onClose: () => void;
    onSent: () => void;
}

export function SendInvoiceDialog({
    invoiceId,
    invoiceNumber,
    clientEmail,
    clientName,
    total,
    onClose,
    onSent,
}: SendInvoiceDialogProps) {
    const [message, setMessage] = useState("");

    const sendInvoice = trpc.invoice.sendToClient.useMutation({
        onSuccess: () => {
            onSent();
        },
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <CardTitle className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Send className="h-5 w-5 text-white" />
                        </div>
                        Enviar Factura
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Preview */}
                        <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Factura</span>
                                <span className="font-medium">{invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Total</span>
                                <span className="font-bold text-green-600">{total}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Para</span>
                                <span className="font-medium">{clientName}</span>
                            </div>
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                Correo
                            </label>
                            <input
                                type="email"
                                value={clientEmail}
                                readOnly
                                className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm"
                            />
                        </div>

                        {/* Custom Message */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Mensaje Personalizado <span className="text-muted-foreground font-normal">(opcional)</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={3}
                                placeholder="Agrega un mensaje personalizado al correo..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                            <Button
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                                onClick={() => sendInvoice.mutate({ id: invoiceId, message: message || undefined })}
                                disabled={sendInvoice.isPending}
                            >
                                {sendInvoice.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Enviar Factura
                                    </>
                                )}
                            </Button>
                            <Button variant="outline" onClick={onClose}>
                                Cancelar
                            </Button>
                        </div>

                        {sendInvoice.isError && (
                            <p className="text-sm text-destructive">{sendInvoice.error.message}</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
