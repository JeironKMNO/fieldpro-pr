import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import { Trophy } from "lucide-react";

interface TopClient {
  clientId: string;
  clientName: string;
  totalPaid: number;
}

function fmtUSD(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

const RANK_COLORS = [
  "text-yellow-500",
  "text-slate-400",
  "text-amber-600",
  "text-slate-500",
  "text-slate-500",
];

export function TopClientsWidget({ clients }: { clients: TopClient[] }) {
  return (
    <Card className="card-fieldpro h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-slate-500">
          <Trophy className="h-4 w-4" />
          Top Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">
            Sin datos aún
          </p>
        ) : (
          <div className="space-y-2">
            {clients.map((client, i) => (
              <div
                key={client.clientId}
                className="flex items-center gap-3 py-1.5"
              >
                <span
                  className={`text-xs font-bold w-4 shrink-0 ${RANK_COLORS[i] ?? "text-slate-500"}`}
                >
                  {i + 1}
                </span>
                <Link
                  href={`/clients/${client.clientId}`}
                  className="flex-1 text-sm text-slate-800 hover:text-teal-600 transition-colors truncate"
                >
                  {client.clientName}
                </Link>
                <span className="text-sm font-semibold text-slate-700 tabular-nums">
                  {fmtUSD(client.totalPaid)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
