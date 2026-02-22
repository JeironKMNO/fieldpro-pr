"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import { Badge } from "@fieldpro/ui/components/badge";
import { ArrowRight, FileText } from "lucide-react";

interface RecentClient {
  id: string;
  name: string;
  type: string;
  createdAt: Date;
  quoteCount: number;
}

function timeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Ayer";
  if (diffDays < 7) return `hace ${diffDays}d`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)}sem`;
  return `hace ${Math.floor(diffDays / 30)}m`;
}

export function RecentClients({ clients }: { clients: RecentClient[] }) {
  return (
    <Card className="h-full border-slate-200 bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base text-slate-900">Clientes Recientes</CardTitle>
        <Link
          href="/clients"
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          Ver Todos <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-slate-500">
            Sin clientes aún
          </div>
        ) : (
          <div className="space-y-3">
            {clients.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-4"
              >
                <div className="space-y-1">
                  <Link
                    href={`/clients/${c.id}`}
                    className="font-medium text-slate-900 hover:text-orange-500 transition-colors"
                  >
                    {c.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        c.type === "COMMERCIAL"
                          ? "border-purple-500/30 bg-purple-500/10 text-purple-400"
                          : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                      }
                    >
                      {c.type === "COMMERCIAL" ? "Comercial" : "Residencial"}
                    </Badge>
                    <span className="text-xs text-slate-500">
                      {timeAgo(c.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                  <FileText className="h-4 w-4" />
                  <span>{c.quoteCount}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
