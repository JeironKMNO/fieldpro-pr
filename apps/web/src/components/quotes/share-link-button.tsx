"use client";

import { useState } from "react";
import { Button } from "@fieldpro/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fieldpro/ui/components/dialog";
import { Check, Copy, Link, MessageCircle, Mail } from "lucide-react";

export function ShareLinkButton({
  shareToken,
  clientPhone,
  clientEmail,
}: {
  shareToken: string;
  clientPhone: string | null;
  clientEmail: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/quotes/share/${shareToken}`
      : "";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = clientPhone
    ? `https://wa.me/${clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola, le envío su cotización para revisión. Puede verla y responder aquí: ${shareUrl}`
      )}`
    : null;

  const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(clientEmail ?? "")}&su=${encodeURIComponent("Cotización Lista para Revisión")}&body=${encodeURIComponent(`Saludos,\n\nAdjunto encontrará su cotización para revisión. Puede verla, aceptarla o declinarla en el siguiente enlace:\n\n${shareUrl}\n\nQuedamos a su disposición para cualquier pregunta.\n\n¡Gracias!`)}`;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Link className="mr-2 h-4 w-4" />
        Compartir
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent onClose={() => setOpen(false)}>
          <DialogHeader>
            <DialogTitle>Compartir Cotización</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Comparte este enlace con tu cliente para que pueda ver y responder
              a la cotización.
            </p>
            <div className="flex gap-2">
              <input
                readOnly
                value={shareUrl}
                className="flex-1 rounded-md border border-input bg-muted px-3 py-2 text-sm"
              />
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              ) : null}
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
    </>
  );
}
