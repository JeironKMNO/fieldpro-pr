"use client";

import { useState, useEffect, useCallback } from "react";

interface StoredMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    images?: string[];
    isAudio?: boolean;
    timestamp: string; // Stored as ISO string
    prices?: Array<{
        name: string;
        price: number;
        unit: string;
        store: string;
        quantity: number;
        subtotal: number;
        source: "homedepot" | "database" | "estimated";
    }>;
}

interface ConversationSession {
    id: string;
    clientId: string;
    clientName: string;
    messages: StoredMessage[];
    createdAt: string;
    updatedAt: string;
}

const STORAGE_KEY = "fieldpro_ai_conversations";
const MAX_SESSIONS = 10;

function getStoredSessions(): ConversationSession[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function storeSessions(sessions: ConversationSession[]) {
    if (typeof window === "undefined") return;
    try {
        // Keep only the last MAX_SESSIONS
        const trimmed = sessions.slice(-MAX_SESSIONS);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.warn("Failed to store conversation sessions:", e);
    }
}

export function useConversationHistory(clientId: string, clientName: string) {
    const [sessionId, setSessionId] = useState<string>("");
    const [messages, setMessages] = useState<StoredMessage[]>([]);

    // Load or create session on mount
    useEffect(() => {
        const sessions = getStoredSessions();
        // Find an existing session for this client that's less than 24h old
        const existingSession = sessions.find(
            (s) =>
                s.clientId === clientId &&
                Date.now() - new Date(s.updatedAt).getTime() < 24 * 60 * 60 * 1000
        );

        if (existingSession) {
            setSessionId(existingSession.id);
            setMessages(existingSession.messages);
        } else {
            const newId = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            setSessionId(newId);
            setMessages([]);
        }
    }, [clientId]);

    // Save messages when they change
    const saveMessages = useCallback(
        (newMessages: StoredMessage[]) => {
            setMessages(newMessages);

            if (!sessionId) return;

            const sessions = getStoredSessions();
            const existingIdx = sessions.findIndex((s) => s.id === sessionId);

            const session: ConversationSession = {
                id: sessionId,
                clientId,
                clientName,
                messages: newMessages,
                createdAt:
                    existingIdx >= 0
                        ? sessions[existingIdx].createdAt
                        : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            if (existingIdx >= 0) {
                sessions[existingIdx] = session;
            } else {
                sessions.push(session);
            }

            storeSessions(sessions);
        },
        [sessionId, clientId, clientName]
    );

    const clearSession = useCallback(() => {
        setMessages([]);
        if (!sessionId) return;

        const sessions = getStoredSessions();
        const filtered = sessions.filter((s) => s.id !== sessionId);
        storeSessions(filtered);
    }, [sessionId]);

    const exportChat = useCallback(() => {
        if (messages.length === 0) return "";

        let exportText = `# Conversación con IA - ${clientName}\n`;
        exportText += `Fecha: ${new Date().toLocaleDateString("es-PR")}\n\n`;
        exportText += "---\n\n";

        for (const msg of messages) {
            const time = new Date(msg.timestamp).toLocaleTimeString("es-PR", {
                hour: "2-digit",
                minute: "2-digit",
            });
            const sender = msg.role === "user" ? "Tú" : "Asistente IA";
            exportText += `**${sender}** (${time}):\n${msg.content}\n\n`;

            if (msg.prices && msg.prices.length > 0) {
                exportText += "| Material | Precio | Cantidad | Subtotal | Tienda |\n";
                exportText += "|----------|--------|----------|----------|--------|\n";
                for (const p of msg.prices) {
                    exportText += `| ${p.name} | $${p.price.toFixed(2)} | ${p.quantity} | $${p.subtotal.toFixed(2)} | ${p.store} |\n`;
                }
                exportText += "\n";
            }
        }

        return exportText;
    }, [messages, clientName]);

    return {
        sessionId,
        messages,
        saveMessages,
        clearSession,
        exportChat,
        hasHistory: messages.length > 0,
    };
}
