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
  ShoppingCart,
  Loader2,
  Plus,
  X,
  RotateCcw,
  Sparkles,
  Store,
  Check,
} from "lucide-react";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

interface MaterialShoppingListProps {
  jobId: string;
  hasQuote: boolean;
}

export function MaterialShoppingList({
  jobId,
  hasQuote,
}: MaterialShoppingListProps) {
  const [addingItem, setAddingItem] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnit, setNewUnit] = useState("");
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const utils = trpc.useUtils();

  const { data: list, isLoading } = trpc.material.getByJob.useQuery({ jobId });

  const generate = trpc.material.generate.useMutation({
    onSuccess: () => {
      utils.material.getByJob.invalidate({ jobId });
      setConfirmRegenerate(false);
    },
  });

  const togglePurchased = trpc.material.togglePurchased.useMutation({
    onSuccess: () => {
      utils.material.getByJob.invalidate({ jobId });
    },
  });

  const addItem = trpc.material.addItem.useMutation({
    onSuccess: () => {
      utils.material.getByJob.invalidate({ jobId });
      setAddingItem(false);
      setNewName("");
      setNewQuantity("");
      setNewUnit("");
    },
  });

  const removeItem = trpc.material.removeItem.useMutation({
    onSuccess: () => {
      utils.material.getByJob.invalidate({ jobId });
    },
  });

  if (!hasQuote) return null;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Lista de Compras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const items = list?.items ?? [];
  const purchasedCount = items.filter((i) => i.purchased).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Lista de Compras
        </CardTitle>
        {list && items.length > 0 && (
          <span className="text-sm text-muted-foreground">
            {purchasedCount}/{items.length} comprados
          </span>
        )}
      </CardHeader>
      <CardContent>
        {/* Empty state - no list generated yet */}
        {!list && (
          <div className="space-y-3 text-center py-4">
            <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Genera una lista de compras a partir de los artículos de la
              cotización usando IA.
            </p>
            <Button
              onClick={() => generate.mutate({ jobId })}
              disabled={generate.isPending}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              {generate.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generando con IA...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generar Lista de Compras
                </>
              )}
            </Button>
            {generate.isError && (
              <p className="text-sm text-destructive">
                {generate.error.message}
              </p>
            )}
          </div>
        )}

        {/* List exists */}
        {list && (
          <div className="space-y-3">
            {/* Items */}
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-2">
                No hay materiales en la lista. Agrega artículos o regenera.
              </p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                      item.purchased
                        ? "bg-muted/50 border-muted"
                        : "bg-background"
                    }`}
                  >
                    {/* Checkbox */}
                    <button
                      onClick={() =>
                        togglePurchased.mutate({ itemId: item.id })
                      }
                      disabled={togglePurchased.isPending}
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        item.purchased
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-muted-foreground/30 hover:border-primary"
                      }`}
                    >
                      {item.purchased && <Check className="h-3 w-3" />}
                    </button>

                    {/* Item info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium ${
                          item.purchased
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {Number(item.quantity)} {item.unit}
                        </span>
                        {item.estimatedPrice && (
                          <span className="text-xs text-muted-foreground">
                            ~{formatCurrency(Number(item.estimatedPrice))}/u
                          </span>
                        )}
                        {item.store && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            {item.store}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem.mutate({ itemId: item.id })}
                      disabled={removeItem.isPending}
                      className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add item inline form */}
            {addingItem ? (
              <div className="space-y-2 rounded-lg border border-dashed p-3">
                <input
                  type="text"
                  placeholder="Nombre del material..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoFocus
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Cant."
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    className="w-20 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <input
                    type="text"
                    placeholder="Unidad (pzas, sacos...)"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!newName.trim() || !newQuantity || !newUnit.trim())
                        return;
                      addItem.mutate({
                        materialListId: list.id,
                        name: newName.trim(),
                        quantity: Number(newQuantity),
                        unit: newUnit.trim(),
                      });
                    }}
                    disabled={
                      addItem.isPending ||
                      !newName.trim() ||
                      !newQuantity ||
                      !newUnit.trim()
                    }
                  >
                    {addItem.isPending ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <Plus className="mr-1 h-3 w-3" />
                    )}
                    Agregar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingItem(false);
                      setNewName("");
                      setNewQuantity("");
                      setNewUnit("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddingItem(true)}
                  className="flex-1"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Agregar Artículo
                </Button>

                {/* Regenerate */}
                {confirmRegenerate ? (
                  <div className="flex gap-1">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => generate.mutate({ jobId })}
                      disabled={generate.isPending}
                    >
                      {generate.isPending ? (
                        <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Confirmar"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmRegenerate(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmRegenerate(true)}
                  >
                    <RotateCcw className="mr-1 h-3.5 w-3.5" />
                    Regenerar
                  </Button>
                )}
              </div>
            )}

            {generate.isError && (
              <p className="text-sm text-destructive">
                {generate.error.message}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
