"use client";

import { cn } from "@fieldpro/ui/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@fieldpro/ui/components/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  description?: string;
  variant?: "default" | "primary" | "coral" | "success";
  trend?: "up" | "down" | "neutral";
}

const variantStyles = {
  default: {
    card: "bg-white border-stone-200",
    iconBg: "bg-stone-100",
    iconColor: "text-stone-600",
  },
  primary: {
    card: "bg-white border-teal-200",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  coral: {
    card: "bg-white border-orange-200",
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
  },
  success: {
    card: "bg-white border-emerald-200",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
  },
};

export function KpiCard({
  title,
  value,
  icon: Icon,
  description,
  variant = "default",
  trend,
}: KpiCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(
      "card-fieldpro transition-all duration-300",
      styles.card
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "text-sm font-medium flex items-center gap-2",
            "text-stone-600"
          )}>
            <div className={cn("p-2 rounded-lg", styles.iconBg)}>
              <Icon className={cn("h-4 w-4", styles.iconColor)} />
            </div>
            {title}
          </CardTitle>
          {trend && (
            <span className={cn(
              "text-xs font-medium",
              trend === "up" && "text-emerald-600",
              trend === "down" && "text-red-500",
              trend === "neutral" && "text-stone-400"
            )}>
              {trend === "up" && "↑"}
              {trend === "down" && "↓"}
              {trend === "neutral" && "→"}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="font-display text-3xl font-semibold text-stone-900 tracking-tight">
          {value}
        </div>
        {description && (
          <p className="text-xs text-stone-500 mt-1.5 font-medium">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
