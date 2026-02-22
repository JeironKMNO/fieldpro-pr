"use client";

import { Card } from "@fieldpro/ui/components/card";
import {
  Send,
  Eye,
  Check,
  X,
  Clock,
  Mail,
  Bell,
} from "lucide-react";

interface Activity {
  id: string;
  createdAt: Date;
  type: string;
  detail: string | null;
}

const ACTIVITY_CONFIG: Record<
  string,
  { label: string; icon: typeof Send; color: string; bg: string }
> = {
  SENT: {
    label: "Cotización enviada",
    icon: Send,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  VIEWED: {
    label: "Cliente vio la cotización",
    icon: Eye,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  ACCEPTED: {
    label: "Cotización aceptada",
    icon: Check,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  REJECTED: {
    label: "Cotización rechazada",
    icon: X,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  EXPIRED: {
    label: "Cotización expirada",
    icon: Clock,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  FOLLOW_UP_SENT: {
    label: "Follow-up enviado",
    icon: Mail,
    color: "text-gray-600",
    bg: "bg-gray-100",
  },
  REMINDER_SENT: {
    label: "Recordatorio de vencimiento enviado",
    icon: Bell,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
};

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-PR", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function QuoteActivityTimeline({
  activities,
}: {
  activities: Activity[];
}) {
  if (activities.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Actividad</h3>
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />

        <div className="space-y-4">
          {activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.type] ?? {
              label: activity.type,
              icon: Clock,
              color: "text-gray-600",
              bg: "bg-gray-100",
            };
            const Icon = config.icon;

            return (
              <div key={activity.id} className="flex items-start gap-3 relative">
                <div
                  className={`flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full ${config.bg} z-10`}
                >
                  <Icon className={`h-3.5 w-3.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm font-medium leading-tight">
                    {config.label}
                  </p>
                  {activity.detail ? (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {activity.detail}
                    </p>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                  {formatDate(activity.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
