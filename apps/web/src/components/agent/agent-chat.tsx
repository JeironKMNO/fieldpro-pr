"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { AgentMessage } from "./agent-message";
import { VoiceRecorderWhisper } from "./voice-recorder-whisper";
import type { PreviewPayload } from "@/server/services/agent-tools";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AgentChatProps {
  messages: ChatMessage[];
  isLoading: boolean;
  activeConversationId: string | null;
  onPreviewUpdate: (payload: PreviewPayload | null) => void;
  onMessagesUpdate: (updater: (prev: ChatMessage[]) => ChatMessage[]) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function AgentChat({
  messages,
  isLoading,
  activeConversationId,
  onPreviewUpdate,
  onMessagesUpdate,
  onLoadingChange,
}: AgentChatProps) {
  const [input, setInput] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  // Keep a live ref to messages so sendMessageWithContent can capture them
  const messagesRef = useRef<ChatMessage[]>(messages);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessageWithContent = useCallback(
    async (content: string) => {
      if (!content || !activeConversationId || isLoading) return;

      setStatusMessage("");
      setStreamingContent("");

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };
      onMessagesUpdate((prev) => [...prev, userMsg]);
      onLoadingChange(true);

      const allMessages = [...messagesRef.current, userMsg];

      abortRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: allMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            conversationId: activeConversationId,
          }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const rawData = line.slice(6);
              try {
                const data = JSON.parse(rawData) as Record<string, unknown>;

                if (currentEvent === "text-delta") {
                  const delta = (data.delta as string) ?? "";
                  accumulatedText += delta;
                  setStreamingContent(accumulatedText);
                } else if (currentEvent === "text-clear") {
                  accumulatedText = "";
                  setStreamingContent("");
                } else if (currentEvent === "status") {
                  setStatusMessage((data.message as string) ?? "");
                } else if (currentEvent === "preview") {
                  onPreviewUpdate(data as unknown as PreviewPayload);
                } else if (currentEvent === "done") {
                  if (accumulatedText.trim()) {
                    const assistantMsg: ChatMessage = {
                      id: crypto.randomUUID(),
                      role: "assistant",
                      content: accumulatedText.trim(),
                    };
                    onMessagesUpdate((prev) => [...prev, assistantMsg]);
                  }
                  setStreamingContent("");
                  setStatusMessage("");
                } else if (currentEvent === "error") {
                  const errMsg: ChatMessage = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content:
                      (data.message as string) ??
                      "Hubo un error. Intenta de nuevo.",
                  };
                  onMessagesUpdate((prev) => [...prev, errMsg]);
                  setStreamingContent("");
                  setStatusMessage("");
                }
              } catch {
                // ignore parse errors
              }
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const errMsg: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Error de conexión. Por favor intenta de nuevo.",
        };
        onMessagesUpdate((prev) => [...prev, errMsg]);
        setStreamingContent("");
        setStatusMessage("");
      } finally {
        onLoadingChange(false);
      }
    },
    [
      activeConversationId,
      isLoading,
      onLoadingChange,
      onMessagesUpdate,
      onPreviewUpdate,
    ]
  );

  const sendMessage = useCallback(async () => {
    const content = input.trim();
    if (!content) return;
    setInput("");
    await sendMessageWithContent(content);
  }, [input, sendMessageWithContent]);

  const handleVoiceTranscription = useCallback(
    (text: string) => {
      void sendMessageWithContent(text);
    },
    [sendMessageWithContent]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  const isEmpty = messages.length === 0 && !streamingContent;

  return (
    <div className="flex h-full flex-col">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isEmpty && !isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-2xl">
              ✦
            </div>
            <p className="text-sm font-medium text-gray-700">
              Cuéntame qué necesitas hoy
            </p>
            <p className="max-w-xs text-xs text-gray-400">
              Puedo crear clientes, cotizaciones, trabajos y facturas —
              guiándote paso a paso.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <AgentMessage
                key={msg.id}
                role={msg.role}
                content={msg.content}
              />
            ))}
            {streamingContent && (
              <AgentMessage
                role="assistant"
                content={streamingContent}
                isStreaming
              />
            )}
            {isLoading && !streamingContent && (
              <AgentMessage role="assistant" content="" isStreaming />
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Status */}
      {statusMessage && (
        <div className="px-4 py-1.5">
          <p className="text-xs text-teal-600">{statusMessage}</p>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-end gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:border-teal-400 focus-within:ring-1 focus-within:ring-teal-200">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeConversationId
                ? "Escribe o graba un mensaje..."
                : "Selecciona o crea una conversación"
            }
            disabled={!activeConversationId || isLoading}
            rows={1}
            className="max-h-32 flex-1 resize-none bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed"
            style={{ minHeight: "24px" }}
          />
          {/* Voice button (Whisper) */}
          <VoiceRecorderWhisper
            onTranscription={handleVoiceTranscription}
            disabled={!activeConversationId || isLoading}
          />
          {/* Send button */}
          <button
            onClick={() => void sendMessage()}
            disabled={!input.trim() || !activeConversationId || isLoading}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600 text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-center text-[10px] text-gray-300">
          Enter para enviar · Shift+Enter para nueva línea · 🎤 para voz
        </p>
      </div>
    </div>
  );
}
