"use client";

import { Menu, Plus } from "lucide-react";

interface AgentTopbarProps {
  conversationTitle: string | null;
  onHistoryOpen: () => void;
  onNewConversation: () => void;
}

export function AgentTopbar({
  conversationTitle,
  onHistoryOpen,
  onNewConversation,
}: AgentTopbarProps) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-3">
      <button
        onClick={onHistoryOpen}
        className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        title="Historial de conversaciones"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="flex flex-1 items-center justify-center gap-2">
        <span className="text-sm font-semibold text-teal-600">✦</span>
        <span className="text-sm font-medium text-gray-700">
          {conversationTitle ?? "Agente FieldPro"}
        </span>
      </div>

      <button
        onClick={onNewConversation}
        className="flex items-center gap-1.5 rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-teal-700"
      >
        <Plus className="h-3.5 w-3.5" />
        Nueva
      </button>
    </div>
  );
}
