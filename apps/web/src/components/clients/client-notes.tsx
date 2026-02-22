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
import { formatDistanceToNow } from "date-fns";

interface NoteUser {
  firstName: string | null;
  lastName: string | null;
}

interface Note {
  id: string;
  content: string;
  type: string;
  createdAt: Date;
  user: NoteUser;
}

interface ClientNotesProps {
  clientId: string;
  initialNotes: Note[];
}

export function ClientNotes({ clientId, initialNotes }: ClientNotesProps) {
  const [content, setContent] = useState("");
  const [type, setType] = useState<"GENERAL" | "IMPORTANT" | "FOLLOW_UP">(
    "GENERAL"
  );

  const utils = trpc.useUtils();
  const createNote = trpc.note.create.useMutation({
    onSuccess: () => {
      setContent("");
      utils.clients.byId.invalidate({ id: clientId });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createNote.mutate({ clientId, content, type });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Agregar una nota..."
            rows={3}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex gap-2">
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as typeof type)
              }
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="GENERAL">General</option>
              <option value="IMPORTANT">Importante</option>
              <option value="FOLLOW_UP">Seguimiento</option>
            </select>
            <Button
              type="submit"
              disabled={!content.trim() || createNote.isPending}
              className="ml-auto"
            >
              {createNote.isPending ? "Agregando..." : "Agregar Nota"}
            </Button>
          </div>
        </form>

        {/* Notes List */}
        <div className="space-y-3">
          {initialNotes.map((note) => (
            <div key={note.id} className="rounded-lg border p-3 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-medium">
                  {note.user.firstName ?? ""} {note.user.lastName ?? ""}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {note.content}
              </p>
              <span className="mt-2 inline-block rounded bg-secondary px-2 py-0.5 text-xs">
                {note.type}
              </span>
            </div>
          ))}

          {initialNotes.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Aún no hay notas
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
