"use client";

import { Trash2, X } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ConversationSummary {
  id: string;
  title: string | null;
  updatedAt: Date;
}

interface HistoryDrawerProps {
  open: boolean;
  conversations: ConversationSummary[];
  activeConversationId: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  onNewConversation: () => void;
  onDelete: (id: string) => void;
}

export function HistoryDrawer({
  open,
  conversations,
  activeConversationId,
  onClose,
  onSelect,
  onNewConversation,
  onDelete,
}: HistoryDrawerProps) {
  const utils = trpc.useUtils();

  const deleteMutation = trpc.agent.delete.useMutation({
    onSuccess: (_data, variables) => {
      void utils.agent.list.invalidate();
      onDelete(variables.id);
    },
  });

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="absolute left-0 top-0 z-40 flex h-full w-72 flex-col border-r border-gray-100 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <span className="text-sm font-semibold text-gray-700">
            Conversaciones
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New conversation button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full rounded-lg border border-teal-200 bg-teal-50 py-2 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
          >
            + Nueva conversación
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {conversations.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-gray-400">
              No hay conversaciones aún.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group mb-1 flex items-center gap-2 rounded-lg px-3 py-2 transition-colors cursor-pointer ${
                  conv.id === activeConversationId
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                onClick={() => {
                  onSelect(conv.id);
                  onClose();
                }}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">
                    {conv.title ?? "Nueva conversación"}
                  </p>
                  <p className="mt-0.5 text-[10px] text-gray-400">
                    {formatDistanceToNow(new Date(conv.updatedAt), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("¿Eliminar esta conversación?")) {
                      deleteMutation.mutate({ id: conv.id });
                    }
                  }}
                  className="shrink-0 rounded p-1 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:text-rose-500"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
