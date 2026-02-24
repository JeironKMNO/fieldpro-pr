"use client";

import Link from "next/link";
import { Card } from "@fieldpro/ui/components/card";
import { Button } from "@fieldpro/ui/components/button";
import { AlertTriangle, MessageCircle, Mail, ExternalLink } from "lucide-react";
import { QuoteStatusBadge } from "@/components/quotes/quote-status-badge";

interface AttentionItem {
  id: string;
  quoteNumber: string;
  status: string;
  reason: string;
  clientName: string;
  clientPhone: string | null;
  clientEmail: string | null;
  shareToken: string;
}

export function NeedsAttention({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) return null;

  return (
    <Card className="border-orange-500/30 bg-orange-500/5">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <h3 className="font-semibold text-slate-900">Necesitan Atención</h3>
          <span className="ml-auto rounded-full bg-orange-500/20 px-2.5 py-0.5 text-xs font-medium text-orange-500">
            {items.length}
          </span>
        </div>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl bg-white border border-slate-200 p-4 shadow-sm"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/quotes/${item.id}`}
                    className="font-medium text-sm text-slate-800 hover:text-orange-500 transition-colors"
                  >
                    {item.quoteNumber}
                  </Link>
                  <QuoteStatusBadge status={item.status} />
                </div>
                <p className="text-sm text-slate-600 truncate">
                  {item.clientName}
                </p>
                <p className="text-xs text-orange-400/80 mt-1">{item.reason}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {item.clientPhone ? (
                  <a
                    href={`https://wa.me/${item.clientPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${item.clientName}, ¿pudiste revisar la cotización que te enviamos?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </a>
                ) : null}
                {item.clientEmail ? (
                  <a
                    href={`https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(item.clientEmail)}&su=${encodeURIComponent(`Follow-up: ${item.quoteNumber}`)}&body=${encodeURIComponent(`Hola ${item.clientName},\n\n¿Pudiste revisar la cotización que te enviamos? Estamos a tu disposición para cualquier pregunta.\n\nSaludos`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                  </a>
                ) : null}
                <Link href={`/quotes/${item.id}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
