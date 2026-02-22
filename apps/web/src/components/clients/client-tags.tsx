"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@fieldpro/ui/components/card";
import { Button } from "@fieldpro/ui/components/button";
import { X, Plus, Tag } from "lucide-react";

interface TagRelation {
  tagId: string;
  tag: {
    id: string;
    name: string;
    color: string;
  };
}

const TAG_COLORS = [
  "#EF4444", "#F97316", "#EAB308", "#22C55E",
  "#06B6D4", "#3B82F6", "#8B5CF6", "#EC4899",
];

export function ClientTags({
  clientId,
  initialTags,
}: {
  clientId: string;
  initialTags: TagRelation[];
}) {
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [showForm, setShowForm] = useState(false);

  const utils = trpc.useUtils();

  const allTags = trpc.tag.list.useQuery();

  const createTag = trpc.tag.create.useMutation({
    onSuccess: (tag) => {
      assignTag.mutate({ clientId, tagId: tag.id });
      setNewTagName("");
      setShowForm(false);
      utils.tag.list.invalidate();
    },
  });

  const assignTag = trpc.tag.assignToClient.useMutation({
    onSuccess: () => {
      utils.clients.byId.invalidate({ id: clientId });
    },
  });

  const removeTag = trpc.tag.removeFromClient.useMutation({
    onSuccess: () => {
      utils.clients.byId.invalidate({ id: clientId });
    },
  });

  const assignedTagIds = new Set(initialTags.map((t) => t.tagId));
  const availableTags = allTags.data?.filter(
    (t) => !assignedTagIds.has(t.id)
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Etiquetas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowForm(!showForm)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Tags */}
        <div className="flex flex-wrap gap-2">
          {initialTags.map(({ tag, tagId }) => (
            <span
              key={tagId}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
              <button
                onClick={() => removeTag.mutate({ clientId, tagId })}
                className="ml-1 hover:opacity-75"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {initialTags.length === 0 && !showForm && (
            <p className="text-sm text-muted-foreground">Sin etiquetas aún</p>
          )}
        </div>

        {/* Available Tags to Assign */}
        {availableTags && availableTags.length > 0 && (
          <div>
            <p className="mb-2 text-xs text-muted-foreground">
              Clic para asignar:
            </p>
            <div className="flex flex-wrap gap-1">
              {availableTags.map((tag) => (
                <button
                  key={tag.id}
                  onClick={() =>
                    assignTag.mutate({ clientId, tagId: tag.id })
                  }
                  className="rounded-full border border-dashed px-2 py-0.5 text-xs hover:bg-accent transition-colors"
                  style={{ borderColor: tag.color, color: tag.color }}
                >
                  + {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create New Tag */}
        {showForm && (
          <div className="space-y-3 rounded-lg border p-3">
            <input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nombre de la etiqueta..."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="flex gap-1">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className="h-6 w-6 rounded-full border-2 transition-transform"
                  style={{
                    backgroundColor: color,
                    borderColor:
                      selectedColor === color ? "white" : "transparent",
                    transform:
                      selectedColor === color ? "scale(1.2)" : "scale(1)",
                    boxShadow:
                      selectedColor === color
                        ? `0 0 0 2px ${color}`
                        : "none",
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() =>
                  createTag.mutate({
                    name: newTagName,
                    color: selectedColor,
                  })
                }
                disabled={!newTagName.trim() || createTag.isPending}
              >
                {createTag.isPending ? "Creando..." : "Crear y Asignar"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
