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
  Send,
  X,
  Loader2,
  Mail,
  MessageCircle,
  Copy,
  Check,
} from "lucide-react";

interface SendQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  shareToken: string;
  clientPhone: string | null;
  clientEmail: string | null;
  onSent: () => void;
}

export function SendQuoteDialog({
  open,
  onOpenChange,
  quoteId,
  shareToken,
  clientPhone,
  clientEmail,
  onSent,
}: SendQuoteDialogProps) {
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const sendQuote = trpc.quote.sendToClient.useMutation({
    onSuccess: () => {
      onSent();
      onOpenChange(false);
      setMessage("");
    },
  });

  const { data: quote } = trpc.quote.byId.useQuery(
    { id: quoteId },
    { enabled: open }
  );

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const shareUrl = `${APP_URL}/quotes/share/${shareToken}`;

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!open) return null;

  const hasContact = clientEmail || clientPhone;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-lg mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center">
              <Send className="h-5 w-5 text-white" />
            </div>
            Enviar Cotización
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Preview */}
            {quote && (
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Cotización</span>
                  <span className="font-medium text-slate-900">
                    {quote.quoteNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total</span>
                  <span className="font-bold text-gold-600">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(Number(quote.total))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Para</span>
                  <span className="font-medium text-slate-900">
                    {quote.client.name}
                  </span>
                </div>
              </div>
            )}

            {/* Contact Methods */}
            {hasContact ? (
              <>
                {/* Email */}
                {clientEmail && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      Enviar por Email
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={clientEmail}
                        readOnly
                        className="flex-1 rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600"
                      />
                    </div>
                  </div>
                )}

                {/* Custom Message */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Mensaje Personalizado{" "}
                    <span className="text-slate-400 font-normal">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={3}
                    placeholder="Agrega un mensaje personalizado al correo..."
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 resize-none"
                  />
                </div>

                {/* Send Button */}
                {clientEmail && (
                  <Button
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white"
                    onClick={() =>
                      sendQuote.mutate({
                        id: quoteId,
                        message: message || undefined,
                      })
                    }
                    disabled={sendQuote.isPending}
                  >
                    {sendQuote.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar por Email
                      </>
                    )}
                  </Button>
                )}

                {/* WhatsApp Option */}
                {clientPhone && (
                  <a
                    href={`https://wa.me/${clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                      `Hola, te envío el enlace a tu cotización: ${shareUrl}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-md border border-emerald-500 text-emerald-600 hover:bg-emerald-50 transition-colors font-medium"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Enviar por WhatsApp
                  </a>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-sm text-amber-800">
                  El cliente no tiene email ni teléfono registrados.
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Actualiza la información del cliente para enviar la
                  cotización.
                </p>
              </div>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-400">
                  O copia el enlace
                </span>
              </div>
            </div>

            {/* Copy Link */}
            <div className="flex gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 truncate"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            {sendQuote.isError && (
              <p className="text-sm text-red-500">{sendQuote.error.message}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
