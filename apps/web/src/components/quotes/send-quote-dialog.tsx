"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@fieldpro/ui/components/dialog";
import { Check, Copy, MessageCircle, Mail } from "lucide-react";

export function SendQuoteDialog({
  open,
  onOpenChange,
  quoteId,
  shareToken,
  clientPhone,
  clientEmail,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  shareToken: string;
  clientPhone: string | null;
  clientEmail: string | null;
  onSent: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [sent, setSent] = useState(false);

  const updateStatus = trpc.quote.updateStatus.useMutation({
    onSuccess: () => {
      setSent(true);
      onSent();
    },
  });

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/quotes/share/${shareToken}`
      : "";

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    updateStatus.mutate({ id: quoteId, status: "SENT" });
  };

  const whatsappUrl = clientPhone
    ? `https://wa.me/${clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola, le envío su cotización para revisión. Puede verla y responder aquí: ${shareUrl}`
      )}`
    : null;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail ?? "")}&su=${encodeURIComponent("Cotización Lista para Revisión")}&body=${encodeURIComponent(`Saludos,\n\nAdjunto encontrará su cotización para revisión. Puede verla, aceptarla o declinarla en el siguiente enlace:\n\n${shareUrl}\n\nQuedamos a su disposición para cualquier pregunta.\n\n¡Gracias!`)}`;

  if (sent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent onClose={() => onOpenChange(false)}>
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle>Cotización Enviada</DialogTitle>
            <p className="text-center text-sm text-muted-foreground">
              La cotización ha sido marcada como enviada. Comparte el enlace con tu cliente.
            </p>
            <div className="flex w-full gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <Mail className="h-4 w-4" />
                Gmail
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Enviar Cotización</DialogTitle>
          <DialogDescription>
            Esto marcará la cotización como enviada y generará un enlace para compartir con tu cliente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={updateStatus.isPending}>
            {updateStatus.isPending ? "Enviando..." : "Enviar Cotización"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
