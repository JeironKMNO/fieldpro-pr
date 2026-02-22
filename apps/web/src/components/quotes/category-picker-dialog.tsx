"use client";

import { trpc } from "@/lib/trpc/client";
import { Button } from "@fieldpro/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@fieldpro/ui/components/dialog";

export function CategoryPickerDialog({
  open,
  onOpenChange,
  quoteId,
  excludeCategoryIds,
  onAdded,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteId: string;
  excludeCategoryIds: string[];
  onAdded: () => void;
}) {
  const categories = trpc.quote.categories.list.useQuery();

  const addSection = trpc.quote.addSection.useMutation({
    onSuccess: () => {
      onAdded();
      onOpenChange(false);
    },
  });

  const availableCategories = categories.data?.filter(
    (c) => !excludeCategoryIds.includes(c.id)
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Agregar Sección</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          {categories.isLoading && (
            <p className="text-sm text-muted-foreground">Cargando categorías...</p>
          )}

          {availableCategories?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Todas las categorías ya están agregadas a esta cotización.
            </p>
          )}

          <div className="grid grid-cols-2 gap-2">
            {availableCategories?.map((category) => (
              <Button
                key={category.id}
                variant="outline"
                className="justify-start"
                onClick={() =>
                  addSection.mutate({
                    quoteId,
                    categoryId: category.id,
                  })
                }
                disabled={addSection.isPending}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
