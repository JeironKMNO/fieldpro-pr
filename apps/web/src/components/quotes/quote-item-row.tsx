"use client";

import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { TableCell, TableRow } from "@fieldpro/ui/components/table";
import { Trash2 } from "lucide-react";

const UNIT_OPTIONS = [
  { value: "SQ_FT", label: "sq ft" },
  { value: "LINEAR_FT", label: "lin ft" },
  { value: "CUBIC_YD", label: "cu yd" },
  { value: "UNIT", label: "unit" },
  { value: "HOUR", label: "hour" },
  { value: "LUMP_SUM", label: "lump" },
];

interface ItemData {
  id: string;
  description: string;
  unitType: string;
  length: unknown;
  width: unknown;
  height: unknown;
  quantity: unknown;
  unitPrice: unknown;
  markupPct: unknown;
  total: unknown;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export function QuoteItemRow({
  item,
  isDraft,
  onUpdate,
}: {
  item: ItemData;
  isDraft: boolean;
  onUpdate: () => void;
}) {
  const [description, setDescription] = useState(item.description);
  const [unitType, setUnitType] = useState(item.unitType);
  const [length, setLength] = useState(
    item.length ? String(Number(item.length)) : ""
  );
  const [width, setWidth] = useState(
    item.width ? String(Number(item.width)) : ""
  );
  const [quantity, setQuantity] = useState(String(Number(item.quantity)));
  const [unitPrice, setUnitPrice] = useState(String(Number(item.unitPrice)));

  const hasAutoCalc = length !== "" && width !== "" && Number(length) > 0 && Number(width) > 0;

  // Calculate auto quantity
  useEffect(() => {
    if (hasAutoCalc) {
      const l = Number(length);
      const w = Number(width);
      const calculatedQty = l * w;
      setQuantity(String(Math.round(calculatedQty * 100) / 100));
    }
  }, [length, width, hasAutoCalc]);

  const updateItem = trpc.quote.updateItem.useMutation({
    onSuccess: onUpdate,
  });

  const removeItem = trpc.quote.removeItem.useMutation({
    onSuccess: onUpdate,
  });

  const saveChanges = useCallback(() => {
    updateItem.mutate({
      itemId: item.id,
      description,
      unitType: unitType as "SQ_FT" | "LINEAR_FT" | "CUBIC_YD" | "UNIT" | "HOUR" | "LUMP_SUM",
      length: length ? Number(length) : null,
      width: width ? Number(width) : null,
      quantity: Number(quantity) || 1,
      unitPrice: Number(unitPrice) || 0,
    });
  }, [item.id, description, unitType, length, width, quantity, unitPrice, updateItem]);

  // Debounced save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        description !== item.description ||
        unitType !== item.unitType ||
        (length ? Number(length) : null) !== (item.length ? Number(item.length) : null) ||
        (width ? Number(width) : null) !== (item.width ? Number(item.width) : null) ||
        Number(unitPrice) !== Number(item.unitPrice)
      ) {
        saveChanges();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [description, unitType, length, width, unitPrice, quantity, saveChanges, item]);

  const inputClass =
    "w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm focus:border-input focus:bg-background focus:outline-none";

  const calculatedTotal =
    (Number(quantity) || 0) * (Number(unitPrice) || 0);

  if (!isDraft) {
    return (
      <TableRow>
        <TableCell>{item.description}</TableCell>
        <TableCell>
          {UNIT_OPTIONS.find((u) => u.value === item.unitType)?.label ?? item.unitType}
        </TableCell>
        <TableCell>{item.length ? String(Number(item.length)) : "—"}</TableCell>
        <TableCell>{item.width ? String(Number(item.width)) : "—"}</TableCell>
        <TableCell>{String(Number(item.quantity))}</TableCell>
        <TableCell>{formatCurrency(Number(item.unitPrice))}</TableCell>
        <TableCell className="text-right font-medium">
          {formatCurrency(Number(item.total))}
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Item description..."
        />
      </TableCell>
      <TableCell>
        <select
          value={unitType}
          onChange={(e) => setUnitType(e.target.value)}
          className="w-full rounded border border-transparent bg-transparent px-0 py-0.5 text-sm focus:border-input focus:bg-background focus:outline-none"
        >
          {UNIT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </TableCell>
      <TableCell>
        <input
          type="number"
          value={length}
          onChange={(e) => setLength(e.target.value)}
          className={inputClass}
          placeholder="—"
          step="0.01"
        />
      </TableCell>
      <TableCell>
        <input
          type="number"
          value={width}
          onChange={(e) => setWidth(e.target.value)}
          className={inputClass}
          placeholder="—"
          step="0.01"
        />
      </TableCell>
      <TableCell>
        <input
          type="number"
          value={quantity}
          onChange={(e) => !hasAutoCalc && setQuantity(e.target.value)}
          className={`${inputClass} ${hasAutoCalc ? "text-muted-foreground bg-muted/50" : ""}`}
          readOnly={hasAutoCalc}
          step="0.01"
        />
      </TableCell>
      <TableCell>
        <input
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          className={inputClass}
          placeholder="0.00"
          step="0.01"
        />
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(calculatedTotal)}
      </TableCell>
      <TableCell>
        <button
          onClick={() => removeItem.mutate({ itemId: item.id })}
          className="rounded p-1 text-muted-foreground hover:text-destructive transition-colors"
          disabled={removeItem.isPending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </TableCell>
    </TableRow>
  );
}
