"use client";

import { useState, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { AgentTopbar } from "./agent-topbar";
import { AgentChat, type ChatMessage } from "./agent-chat";
import { AgentPreview } from "./agent-preview";
import { HistoryDrawer } from "./history-drawer";
import type { PreviewPayload } from "@/server/services/agent-tools";

interface ConversationSummary {
  id: string;
  title: string | null;
  updatedAt: Date;
}

interface AgentPageClientProps {
  initialConversations: ConversationSummary[];
}

export function AgentPageClient({
  initialConversations,
}: AgentPageClientProps) {
  const [conversations, setConversations] =
    useState<ConversationSummary[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const utils = trpc.useUtils();

  const createConversation = trpc.agent.create.useMutation({
    onSuccess: (conv) => {
      const summary: ConversationSummary = {
        id: conv.id,
        title: conv.title,
        updatedAt: conv.updatedAt,
      };
      setConversations((prev) => [summary, ...prev]);
      setActiveConversationId(conv.id);
      setMessages([]);
      setPreview(null);
    },
  });

  const loadConversation = trpc.agent.byId.useQuery(
    { id: activeConversationId! },
    {
      enabled: false,
    }
  );

  const handleNewConversation = useCallback(async () => {
    if (isLoading) return;
    createConversation.mutate({});
  }, [isLoading, createConversation]);

  const handleSelectConversation = useCallback(
    async (id: string) => {
      if (id === activeConversationId) return;
      setActiveConversationId(id);
      setPreview(null);

      try {
        const data = await utils.agent.byId.fetch({ id });
        if (data) {
          const loaded: ChatMessage[] = data.messages.map((m) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          }));
          setMessages(loaded);
        }
      } catch {
        setMessages([]);
      }
    },
    [activeConversationId, utils]
  );

  const handleDeleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConversationId === id) {
        setActiveConversationId(null);
        setMessages([]);
        setPreview(null);
      }
    },
    [activeConversationId]
  );

  // Keep conversation list updated when title changes after first message
  const handleMessagesUpdate = useCallback(
    (updater: (prev: ChatMessage[]) => ChatMessage[]) => {
      setMessages(updater);
      // Refresh conversation list to pick up auto-title
      setTimeout(() => {
        void utils.agent.list.invalidate().then(async () => {
          try {
            const list = await utils.agent.list.fetch();
            setConversations(list as ConversationSummary[]);
          } catch {
            // ignore
          }
        });
      }, 1000);
    },
    [utils]
  );

  const activeTitle =
    conversations.find((c) => c.id === activeConversationId)?.title ?? null;

  return (
    <div className="relative flex h-full flex-col overflow-hidden">
      {/* Topbar */}
      <AgentTopbar
        conversationTitle={activeTitle}
        onHistoryOpen={() => setHistoryOpen(true)}
        onNewConversation={() => void handleNewConversation()}
      />

      {/* Split panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat — 45% */}
        <div className="flex w-[45%] min-w-0 flex-col border-r border-gray-100">
          <AgentChat
            messages={messages}
            isLoading={isLoading}
            activeConversationId={activeConversationId}
            onPreviewUpdate={setPreview}
            onMessagesUpdate={handleMessagesUpdate}
            onLoadingChange={setIsLoading}
          />
        </div>

        {/* Preview — 55% */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AgentPreview preview={preview} />
        </div>
      </div>

      {/* History drawer (overlays chat panel) */}
      {historyOpen && (
        <div className="absolute inset-0 z-30">
          <HistoryDrawer
            open={historyOpen}
            conversations={conversations}
            activeConversationId={activeConversationId}
            onClose={() => setHistoryOpen(false)}
            onSelect={(id) => void handleSelectConversation(id)}
            onNewConversation={() => void handleNewConversation()}
            onDelete={handleDeleteConversation}
          />
        </div>
      )}

      {/* No conversation selected overlay */}
      {!activeConversationId && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-2xl bg-white p-8 shadow-lg text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-2xl">
              ✦
            </div>
            <p className="text-sm font-semibold text-gray-700">
              Bienvenido al Agente FieldPro
            </p>
            <p className="max-w-xs text-xs text-gray-400">
              Tu gerente de negocios IA. Crea clientes, cotizaciones, trabajos y
              facturas con solo conversar.
            </p>
            <button
              onClick={() => void handleNewConversation()}
              disabled={createConversation.isPending}
              className="mt-1 rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700 disabled:opacity-60"
            >
              {createConversation.isPending
                ? "Creando..."
                : "Iniciar conversación"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
