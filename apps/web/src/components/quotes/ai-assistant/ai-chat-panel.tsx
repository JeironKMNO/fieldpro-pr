"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  X,
  Sparkles,
  FileText,
  RotateCcw,
  ChevronDown,
  Download,
  ImageIcon,
  History,
  Download as DownloadIcon,
  AlertCircle,
  RefreshCw,
  WifiOff,
  Clock,
  Server,
  Square,
  Pencil,
  Check,
} from "lucide-react";
import { Button } from "@fieldpro/ui/components/button";
import {
  ChatMessage,
  ThinkingIndicator,
  PriceResultsCard,
  StatusMessage,
} from "./chat-message";
import { VoiceRecorder } from "./voice-recorder";
import { ImageUpload } from "./image-upload";
import { generateProposalPDF } from "./proposal-pdf";
import { useConversationHistory } from "./use-conversation-history";

// Helper function for delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Error classification helper
interface ErrorInfo {
  message: string;
  type: "network" | "timeout" | "rate_limit" | "server" | "unknown";
  retryable: boolean;
}

function getErrorInfo(error: unknown): ErrorInfo {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Network errors
  if (
    errorMessage.includes("fetch") ||
    errorMessage.includes("network") ||
    errorMessage.includes("Failed to fetch") ||
    errorMessage.includes("ECONNREFUSED") ||
    (error instanceof TypeError && errorMessage.includes("fetch"))
  ) {
    return {
      message:
        "🔌 Problema de conexión. Verifica tu internet e intenta de nuevo.",
      type: "network",
      retryable: true,
    };
  }

  // Timeout errors
  if (
    errorMessage.includes("timeout") ||
    errorMessage.includes("Timeout") ||
    errorMessage.includes("ETIMEDOUT") ||
    errorMessage.includes("abort")
  ) {
    return {
      message:
        "⏱️ La conexión tardó demasiado. Esto puede deberse a una consulta compleja. Intenta de nuevo.",
      type: "timeout",
      retryable: true,
    };
  }

  // Rate limit errors
  if (
    errorMessage.includes("rate") ||
    errorMessage.includes("429") ||
    errorMessage.includes("Too Many Requests")
  ) {
    return {
      message:
        "🐌 Demasiadas solicitudes. Por favor espera un momento e intenta de nuevo.",
      type: "rate_limit",
      retryable: true,
    };
  }

  // Server errors (5xx)
  if (
    errorMessage.includes("500") ||
    errorMessage.includes("502") ||
    errorMessage.includes("503") ||
    errorMessage.includes("504") ||
    errorMessage.includes("Internal Server Error")
  ) {
    return {
      message:
        "🔧 Error del servidor. Nuestro equipo ha sido notificado. Intenta de nuevo en unos momentos.",
      type: "server",
      retryable: true,
    };
  }

  // Default unknown error
  return {
    message:
      "❌ Lo siento, hubo un error inesperado. Por favor intenta de nuevo.",
    type: "unknown",
    retryable: false,
  };
}

// Error message component
interface ErrorMessageProps {
  message: string;
  type: "network" | "timeout" | "rate_limit" | "server" | "unknown";
  onRetry?: () => void;
  retryable?: boolean;
}

function ErrorMessageCard({
  message,
  type,
  onRetry,
  retryable,
}: ErrorMessageProps) {
  const icons = {
    network: WifiOff,
    timeout: Clock,
    rate_limit: AlertCircle,
    server: Server,
    unknown: AlertCircle,
  };

  const colors = {
    network:
      "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
    timeout:
      "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800",
    rate_limit:
      "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
    server:
      "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
    unknown:
      "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950/30 dark:border-gray-800",
  };

  const Icon = icons[type];

  return (
    <div
      className={`rounded-xl border p-4 ${colors[type]} animate-in fade-in slide-in-from-bottom-2`}
    >
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{message}</p>
          {retryable && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-3 bg-white/50 dark:bg-black/20 border-current hover:bg-white dark:hover:bg-black/30"
            >
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Intentar de nuevo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: string[];
  isAudio?: boolean;
  timestamp: Date;
  isStreaming?: boolean;
  prices?: MaterialPrice[];
  statusMessage?: string;
  isError?: boolean;
  errorType?: "network" | "timeout" | "rate_limit" | "server" | "unknown";
  retryable?: boolean;
}

interface MaterialPrice {
  name: string;
  price: number;
  unit: string;
  store: string;
  quantity: number;
  subtotal: number;
  source: "homedepot" | "database" | "estimated";
  url?: string;
  thumbnail?: string;
}

interface QuoteData {
  title: string;
  sections: Array<{
    category: string;
    items: Array<{
      description: string;
      unitType: string;
      quantity: number;
      unitPrice: number;
      markupPct: number;
      length?: number;
      width?: number;
      height?: number;
    }>;
  }>;
  notes?: string;
}

interface AIChatPanelProps {
  clientId: string;
  clientName: string;
  organizationName?: string;
  organizationLogo?: string | null;
  organizationPhone?: string | null;
  organizationLicense?: string | null;
  onQuoteGenerated: (data: QuoteData) => void;
  onClose: () => void;
}

export function AIChatPanel({
  clientId,
  clientName,
  organizationName,
  organizationLogo,
  organizationPhone,
  organizationLicense,
  onQuoteGenerated,
  onClose,
}: AIChatPanelProps) {
  // Load conversation history
  const {
    messages: storedMessages,
    saveMessages,
    clearSession,
    exportChat,
    hasHistory,
  } = useConversationHistory(clientId, clientName);

  const [messages, setMessages] = useState<Message[]>([]);
  const [showHistoryNotice, setShowHistoryNotice] = useState(false);
  // Guard: only initialize once. Without this, every call to saveMessages updates
  // storedMessages → triggers this effect → resets messages mid-stream (causes flicker).
  const initializedRef = useRef(false);

  // Initialize messages from history or welcome message — runs only once on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (storedMessages.length > 0) {
      // Convert stored messages to component format
      const loadedMessages: Message[] = storedMessages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        images: m.images,
        isAudio: m.isAudio,
        timestamp: new Date(m.timestamp),
        isStreaming: false,
        prices: m.prices,
      }));
      setMessages(loadedMessages);
      setShowHistoryNotice(true);
      // Hide notice after 5 seconds
      setTimeout(() => setShowHistoryNotice(false), 5000);
    } else {
      // Fresh start with welcome message
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: `¡Hola! 👋 Soy tu asistente de cotización con IA. Estoy aquí para ayudarte a crear una cotización profesional para **${clientName}**.\n\n¿Cómo quieres comenzar?\n\n- 📝 **Escríbeme** los detalles del proyecto\n- 🎤 **Graba un audio** describiendo el trabajo\n- 📸 **Sube fotos** del sitio o del trabajo a realizar\n\nPuedes combinar las tres opciones. Mientras más detalles me des (medidas, materiales, tipo de trabajo), más precisa será la cotización.`,
          timestamp: new Date(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storedMessages, clientName]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const MAX_RETRIES = 3;
  const RETRY_DELAY = [1000, 2000, 4000]; // Exponential backoff delays
  const [selectedImages, setSelectedImages] = useState<
    { mimeType: string; data: string; preview: string }[]
  >([]);
  const [generatedQuote, setGeneratedQuote] = useState<QuoteData | null>(null);
  const [companyLogo, setCompanyLogo] = useState<string | null>(
    organizationLogo ?? null
  );
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  // Ref to always hold the latest sendMessage — fixes stale closure in handleVoiceTranscription
  const sendMessageRef = useRef<
    (
      text: string,
      images?: { mimeType: string; data: string }[],
      imagePreviews?: string[],
      isVoice?: boolean,
      isRetry?: boolean
    ) => Promise<void>
  >(() => Promise.resolve());

  // Handle logo file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCompanyLogo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Detect scroll position to show/hide scroll-down button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollDown(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Track last voice send to prevent duplicates
  const lastVoiceSendRef = useRef<{ text: string; timestamp: number } | null>(
    null
  );

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length === 0) return;

    // Don't save streaming messages or welcome message-only states
    const messagesToSave = messages
      .filter(
        (m) => m.id !== "welcome" && m.id !== "welcome-reset" && !m.isStreaming
      )
      .map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        images: m.images,
        isAudio: m.isAudio,
        timestamp: m.timestamp.toISOString(),
        prices: m.prices,
      }));

    if (messagesToSave.length > 0) {
      saveMessages(messagesToSave);
    }
  }, [messages, saveMessages]);

  const sendMessage = async (
    text: string,
    images?: { mimeType: string; data: string }[],
    imagePreviews?: string[],
    isVoice?: boolean,
    isRetry: boolean = false,
    retryingMessageId?: string
  ) => {
    if (!text.trim() && !images?.length) return;

    // Guard against concurrent sends
    if (sendingRef.current) {
      console.log("[AI Chat] Send blocked: already sending");
      return;
    }

    // Additional guard for voice: prevent duplicate sends within 2 seconds
    if (isVoice && lastVoiceSendRef.current) {
      const timeSinceLastSend = Date.now() - lastVoiceSendRef.current.timestamp;
      const isDuplicateText =
        lastVoiceSendRef.current.text.trim() === text.trim();

      if (timeSinceLastSend < 2000 && isDuplicateText) {
        console.log(
          "[AI Chat] Voice send blocked: duplicate detected within 2s"
        );
        return;
      }
    }

    sendingRef.current = true;

    // Track voice send
    if (isVoice) {
      lastVoiceSendRef.current = { text, timestamp: Date.now() };
    }

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Reset retry count on new user message
    if (!isRetry) {
      setRetryCount(0);
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      images: imagePreviews,
      isAudio: isVoice,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setSelectedImages([]);
    setIsLoading(true);
    setStatusText(null);

    // Create streaming assistant message placeholder
    const streamingMsgId = Date.now().toString() + "-ai";

    try {
      // Build message history for API
      const apiMessages = [
        ...messages
          .filter((m) => m.id !== "welcome" && !m.isStreaming)
          .map((m) => ({
            role: m.role,
            content: m.content,
          })),
        {
          role: "user" as const,
          content: text || "[Image upload]",
        },
      ];

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          images: images,
          stream: true,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const contentType = response.headers.get("content-type");

      // ── STREAMING RESPONSE ──
      if (contentType?.includes("text/event-stream")) {
        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let accumulatedText = "";

        // Add streaming message
        setMessages((prev) => [
          ...prev,
          {
            id: streamingMsgId,
            role: "assistant",
            content: "",
            timestamp: new Date(),
            isStreaming: true,
          },
        ]);
        setIsLoading(false); // Hide thinking indicator, show streaming cursor

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages
          const lines = buffer.split("\n");
          buffer = "";

          let currentEvent = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              currentEvent = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              const dataStr = line.slice(6);
              try {
                const data = JSON.parse(dataStr);

                switch (currentEvent) {
                  case "text-delta":
                    accumulatedText += data.delta;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === streamingMsgId
                          ? { ...m, content: accumulatedText }
                          : m
                      )
                    );
                    break;

                  case "text-clear":
                    accumulatedText = "";
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === streamingMsgId ? { ...m, content: "" } : m
                      )
                    );
                    break;

                  case "status":
                    setStatusText(data.message);
                    break;

                  case "prices":
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === streamingMsgId
                          ? { ...m, prices: data.prices }
                          : m
                      )
                    );
                    break;

                  case "quote":
                    setGeneratedQuote(data.data as QuoteData);
                    break;

                  case "error":
                    accumulatedText = `❌ ${data.message}`;
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === streamingMsgId
                          ? {
                              ...m,
                              content: accumulatedText,
                              isStreaming: false,
                            }
                          : m
                      )
                    );
                    break;

                  case "done":
                    // Finalize the streaming message
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === streamingMsgId
                          ? { ...m, isStreaming: false }
                          : m
                      )
                    );
                    setStatusText(null);

                    // If quote was generated, add confirmation message
                    if (generatedQuote) {
                      const quoteMessage: Message = {
                        id: Date.now().toString() + "-quote",
                        role: "assistant",
                        content: `✅ **¡Cotización generada!** He preparado un borrador de cotización para "${generatedQuote.title}" con ${generatedQuote.sections.length} secciones. Revisa el resumen abajo y confirma si deseas crear la cotización.`,
                        timestamp: new Date(),
                      };
                      setMessages((prev) => [...prev, quoteMessage]);
                    }
                    break;
                }
              } catch {
                // Incomplete JSON, add back to buffer
                buffer = line + "\n";
              }
            } else if (line.trim() === "") {
              currentEvent = "";
            } else {
              // Incomplete line, keep in buffer
              buffer += line + "\n";
            }
          }
        }

        return;
      }

      // ── NON-STREAMING FALLBACK ──
      const data = await response.json();

      // Add assistant response
      if (data.text) {
        const assistantMessage: Message = {
          id: streamingMsgId,
          role: "assistant",
          content: data.text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }

      // Handle price results
      if (data.priceResults?.length > 0) {
        const priceMsg: Message = {
          id: Date.now().toString() + "-prices",
          role: "assistant",
          content: "",
          timestamp: new Date(),
          prices: data.priceResults[0].result as MaterialPrice[],
        };
        setMessages((prev) => [...prev, priceMsg]);
      }

      // Check for generated quote data
      if (data.functionCalls?.length > 0) {
        const quoteCall = data.functionCalls.find(
          (fc: { name: string }) => fc.name === "generate_quote_data"
        );
        if (quoteCall) {
          const quoteData = quoteCall.result as QuoteData;
          setGeneratedQuote(quoteData);

          const quoteMessage: Message = {
            id: Date.now().toString() + "-quote",
            role: "assistant",
            content: `✅ **¡Cotización generada!** He preparado un borrador de cotización para "${quoteData.title}" con ${quoteData.sections.length} secciones. Revisa el resumen abajo y confirma si deseas crear la cotización.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, quoteMessage]);
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;

      console.error("Error sending message:", error);

      // Determine error type and user-friendly message
      const errorInfo = getErrorInfo(error);

      // Check if we should retry
      const currentRetry = isRetry ? retryCount : 0;
      if (errorInfo.retryable && currentRetry < MAX_RETRIES && !isRetry) {
        setStatusText(`Reintentando (${currentRetry + 1}/${MAX_RETRIES})...`);
        setRetryCount(currentRetry + 1);

        // Wait before retrying
        await delay(RETRY_DELAY[currentRetry] || 4000);

        // Retry the request
        sendingRef.current = false;
        sendMessage(text, images, imagePreviews, isVoice, true);
        return;
      }

      // Final error - show to user
      const errorMessage: Message = {
        id: Date.now().toString() + "-error",
        role: "assistant",
        content: errorInfo.message,
        timestamp: new Date(),
        isError: true,
        errorType: errorInfo.type,
        retryable: errorInfo.retryable && !isRetry,
      };

      // If retrying a specific message, replace it; otherwise add new
      if (retryingMessageId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === retryingMessageId ? errorMessage : m))
        );
      } else {
        setMessages((prev) => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      setStatusText(null);
      abortControllerRef.current = null;
      sendingRef.current = false;
      if (!isRetry) {
        setRetryCount(0);
      }
    }
  };

  const triggerSend = () => {
    const imgs =
      selectedImages.length > 0
        ? selectedImages.map((img) => ({
            mimeType: img.mimeType,
            data: img.data,
          }))
        : undefined;
    const previews =
      selectedImages.length > 0
        ? selectedImages.map((img) => img.preview)
        : undefined;
    sendMessage(inputText, imgs, previews, false, false);
  };

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    triggerSend();
  };

  const handleRetry = (messageId: string) => {
    // Find the last user message before this error
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex <= 0) return;

    // Find the last user message to retry
    let userMessage: Message | null = null;
    for (let i = messageIndex - 1; i >= 0; i--) {
      if (messages[i].role === "user") {
        userMessage = messages[i];
        break;
      }
    }

    if (!userMessage) return;

    // Remove the error message and retry
    setMessages((prev) => prev.filter((m) => m.id !== messageId));

    sendMessage(
      userMessage.content,
      undefined,
      userMessage.images,
      userMessage.isAudio,
      false,
      messageId
    );
  };

  // Keep sendMessageRef in sync with the latest sendMessage on every render
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  });

  // Debounced voice handler to prevent rapid-fire sends
  const voiceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleVoiceTranscription = useCallback((text: string) => {
    // Clear any pending voice send
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
    }

    // Use ref so we always call the latest sendMessage (avoids stale closure)
    voiceTimeoutRef.current = setTimeout(() => {
      sendMessageRef.current(text, undefined, undefined, true, false);
      voiceTimeoutRef.current = null;
    }, 150);
  }, []); // empty deps intentional — latest fn accessed via ref

  useEffect(() => {
    return () => {
      if (voiceTimeoutRef.current) {
        clearTimeout(voiceTimeoutRef.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      triggerSend();
    }
  };

  const handleCreateQuote = () => {
    if (generatedQuote) {
      onQuoteGenerated(generatedQuote);
    }
  };

  const resetChat = () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear from storage
    clearSession();

    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: `Conversación reiniciada. ¿En qué proyecto necesitas cotización para **${clientName}**?`,
        timestamp: new Date(),
      },
    ]);
    setGeneratedQuote(null);
    setSelectedImages([]);
    setInputText("");
    setIsLoading(false);
    setStatusText(null);
    setShowHistoryNotice(false);
    setEditingMessageId(null);
    setEditText("");
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Mark the streaming message as complete
    setMessages((prev) =>
      prev.map((m) =>
        m.isStreaming
          ? {
              ...m,
              isStreaming: false,
              content: m.content + "\n\n*[Respuesta interrumpida]*",
            }
          : m
      )
    );

    setIsLoading(false);
    setStatusText(null);
    sendingRef.current = false;
  };

  const startEditingMessage = (messageId: string, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditText(currentContent);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditText("");
  };

  const saveEditedMessage = () => {
    if (!editText.trim() || !editingMessageId) return;

    // Find the message being edited
    const messageIndex = messages.findIndex((m) => m.id === editingMessageId);
    if (messageIndex === -1) return;

    const oldMessage = messages[messageIndex];
    if (oldMessage.role !== "user") return;

    // Update the message
    setMessages((prev) =>
      prev.map((m, i) => (i === messageIndex ? { ...m, content: editText } : m))
    );

    setEditingMessageId(null);
    setEditText("");

    // Remove all messages after this one (the old response)
    setMessages((prev) => prev.slice(0, messageIndex + 1));

    // Clear any generated quote
    setGeneratedQuote(null);

    // Re-send the edited message
    sendingRef.current = false;
    setTimeout(() => {
      sendMessage(editText, undefined, oldMessage.images, oldMessage.isAudio);
    }, 100);
  };

  const handleExportChat = () => {
    const content = exportChat();
    if (!content) return;

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversacion-${clientName}-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Quick action buttons for common requests
  const quickActions = [
    {
      label: "🏠 Remodelación de cocina",
      text: "Necesito cotizar una remodelación completa de cocina, incluyendo demolición, plomería, electricidad, piso y gabinetes.",
    },
    {
      label: "🔧 Reparación de techo",
      text: "Necesito reparar un techo de zinc, tiene filtraciones y necesita impermeabilización.",
    },
    {
      label: "🎨 Pintura interior",
      text: "Quiero cotizar pintura interior para una casa de 3 habitaciones, 2 baños, sala y cocina.",
    },
  ];

  const showQuickActions = messages.length <= 1 && !isLoading;

  return (
    <div className="flex flex-col h-full bg-background rounded-xl border border-border shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">
              Asistente IA de Cotización
            </h3>
            <p className="text-[11px] text-white/70">
              Asistente IA • Cliente: {clientName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {hasHistory && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              onClick={handleExportChat}
              title="Descargar conversación"
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            onClick={resetChat}
            title="Reiniciar conversación"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth relative"
      >
        {messages.map((msg, index) => (
          <div key={msg.id}>
            {msg.isError ? (
              <ErrorMessageCard
                message={msg.content}
                type={msg.errorType || "unknown"}
                retryable={msg.retryable}
                onRetry={msg.retryable ? () => handleRetry(msg.id) : undefined}
              />
            ) : editingMessageId === msg.id ? (
              // Edit mode
              <div className="flex gap-2 animate-in fade-in">
                <div className="flex-1">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) {
                        saveEditedMessage();
                      } else if (e.key === "Escape") {
                        cancelEditing();
                      }
                    }}
                    className="w-full rounded-lg border border-primary/50 bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={saveEditedMessage}
                      disabled={!editText.trim()}
                      className="bg-primary text-white"
                    >
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                      Guardar y reenviar
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEditing}>
                      Cancelar
                    </Button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Cmd+Enter para guardar • Esc para cancelar
                  </p>
                </div>
              </div>
            ) : (
              <div className="group relative">
                <ChatMessage
                  role={msg.role}
                  content={msg.content}
                  images={msg.images}
                  isAudio={msg.isAudio}
                  timestamp={msg.timestamp}
                  isStreaming={msg.isStreaming}
                />
                {/* Edit button for user messages */}
                {msg.role === "user" &&
                  !msg.isStreaming &&
                  index === messages.length - 1 && (
                    <button
                      onClick={() => startEditingMessage(msg.id, msg.content)}
                      className="absolute top-0 right-0 -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full bg-muted hover:bg-accent text-muted-foreground"
                      title="Editar mensaje"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                  )}
              </div>
            )}
            {/* Show price results card below the message */}
            {msg.prices && msg.prices.length > 0 && (
              <div className="mt-2">
                <PriceResultsCard prices={msg.prices} />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col gap-2">
            <ThinkingIndicator />
            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={handleStopStreaming}
                className="text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                <Square className="mr-1.5 h-3 w-3 fill-current" />
                Detener respuesta
              </Button>
            </div>
          </div>
        )}

        {/* Status message during streaming */}
        {statusText && <StatusMessage message={statusText} />}

        {/* History Restored Notice */}
        {showHistoryNotice && hasHistory && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 mx-4 mb-2">
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 px-3 py-2">
              <History className="h-4 w-4 text-blue-500 flex-shrink-0" />
              <span className="text-sm text-blue-700 dark:text-blue-300 flex-1">
                Conversación anterior restaurada
              </span>
              <button
                onClick={() => setShowHistoryNotice(false)}
                className="text-blue-400 hover:text-blue-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="space-y-2 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 delay-500">
            <p className="text-xs text-muted-foreground ml-11">
              Acciones rápidas:
            </p>
            <div className="flex flex-wrap gap-2 ml-11">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(action.text)}
                  className="text-xs px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent hover:border-primary/30 transition-all duration-200 text-left shadow-sm hover:shadow-md"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Generated Quote Preview */}
        {generatedQuote && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <h4 className="font-semibold text-sm">
                  Borrador: {generatedQuote.title}
                </h4>
              </div>
              <div className="space-y-2">
                {generatedQuote.sections.map((section, idx) => {
                  const sectionTotal = section.items.reduce((sum, item) => {
                    const qty = item.quantity;
                    const total =
                      qty * item.unitPrice * (1 + item.markupPct / 100);
                    return sum + total;
                  }, 0);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm py-1.5 px-3 rounded-md bg-background/60"
                    >
                      <span className="font-medium">{section.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">
                          {section.items.length} items
                        </span>
                        <span className="font-semibold text-primary">
                          ${sectionTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="font-bold text-sm">Subtotal estimado:</span>
                <span className="font-bold text-lg text-primary">
                  $
                  {generatedQuote.sections
                    .reduce(
                      (total, s) =>
                        total +
                        s.items.reduce(
                          (sum, i) =>
                            sum +
                            i.quantity * i.unitPrice * (1 + i.markupPct / 100),
                          0
                        ),
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>
              {generatedQuote.notes && (
                <p className="text-xs text-muted-foreground italic border-t border-border pt-2">
                  📝 {generatedQuote.notes}
                </p>
              )}
              {/* Logo upload (hidden) */}
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <div className="flex gap-2 pt-1">
                <Button
                  className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white"
                  onClick={handleCreateQuote}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Crear Cotización
                </Button>
                <Button
                  variant="outline"
                  className="border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-950/30"
                  onClick={() => {
                    if (generatedQuote) {
                      generateProposalPDF(generatedQuote, {
                        companyName: organizationName || "Mi Empresa",
                        companyPhone: organizationPhone || undefined,
                        companyLicense: organizationLicense || undefined,
                        clientName: clientName,
                        logoBase64: companyLogo || undefined,
                      });
                    }
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Propuesta PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setGeneratedQuote(null);
                    sendMessage(
                      "Necesito hacer ajustes a la cotización. ¿Qué cambios puedo hacer?",
                      undefined,
                      undefined,
                      undefined
                    );
                  }}
                >
                  Ajustar
                </Button>
              </div>
              {/* Logo upload button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                >
                  <ImageIcon className="h-3 w-3" />
                  {companyLogo
                    ? "Logo cargado — cambiar"
                    : "Agregar logo de empresa al PDF"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollDown && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10">
          <Button
            size="icon"
            variant="outline"
            className="h-8 w-8 rounded-full shadow-lg bg-background/80 backdrop-blur border-border"
            onClick={scrollToBottom}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 border-t border-border bg-background/95 backdrop-blur-sm">
        {/* Selected image previews (above input) */}
        {selectedImages.length > 0 && (
          <div className="px-3 pt-2.5">
            <ImageUpload
              onImagesSelected={() => {}}
              selectedImages={selectedImages}
              onRemoveImage={(idx) =>
                setSelectedImages((prev) => prev.filter((_, i) => i !== idx))
              }
              disabled={isLoading}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-3 pt-2.5 pb-1 space-y-2">
          {/* Text Input — full width, auto-expand */}
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            placeholder="Describe el proyecto, medidas, materiales... (Enter para enviar, Shift+Enter para nueva línea)"
            className="w-full resize-none rounded-xl border border-input bg-muted/40 px-4 py-3 text-sm placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-h-28 leading-relaxed"
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 112) + "px";
            }}
            disabled={isLoading}
          />

          {/* Bottom toolbar: media left · send right */}
          <div className="flex items-center justify-between">
            {/* Media action buttons */}
            <div className="flex items-center gap-1">
              <ImageUpload
                onImagesSelected={(imgs) =>
                  setSelectedImages((prev) => [...prev, ...imgs])
                }
                selectedImages={[]}
                onRemoveImage={() => {}}
                disabled={isLoading}
              />
              <VoiceRecorder
                onTranscription={handleVoiceTranscription}
                disabled={isLoading}
              />
            </div>

            {/* Send button */}
            <Button
              type="submit"
              size="sm"
              className="rounded-xl h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm gap-2 font-medium"
              disabled={
                isLoading || (!inputText.trim() && selectedImages.length === 0)
              }
            >
              <Send className="h-3.5 w-3.5" />
              Enviar
            </Button>
          </div>
        </form>

        <p className="px-3 pb-2.5 text-[10px] text-muted-foreground/60 text-center">
          IA puede cometer errores · Verifica precios antes de enviar al cliente
        </p>
      </div>
    </div>
  );
}
