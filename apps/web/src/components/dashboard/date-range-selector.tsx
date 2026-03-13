"use client";

import { Select } from "@fieldpro/ui/components/select";

export type DateRange = "30d" | "90d" | "6m" | "ytd" | "all";

const RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: "30d", label: "Últimos 30 días" },
  { value: "90d", label: "Últimos 90 días" },
  { value: "6m", label: "Últimos 6 meses" },
  { value: "ytd", label: "Este año" },
  { value: "all", label: "Todo el tiempo" },
];

interface DateRangeSelectorProps {
  value: DateRange;
  onRangeChange: (range: DateRange) => void;
}

export function DateRangeSelector({
  value,
  onRangeChange,
}: DateRangeSelectorProps) {
  return (
    <Select
      value={value}
      onChange={(e) => onRangeChange(e.target.value as DateRange)}
      className="w-[180px] h-8 text-xs"
    >
      {RANGE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Select>
  );
}
