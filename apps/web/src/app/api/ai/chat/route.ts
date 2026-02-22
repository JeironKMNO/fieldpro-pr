import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getActiveProvider, SYSTEM_PROMPT } from "@/server/services/ai-provider";
import { searchMaterialPrices } from "@/server/services/price-search";

export const maxDuration = 60;

// ═══════════════════════════════════════════════════════════════
// SSE Streaming Helpers
// ═══════════════════════════════════════════════════════════════

function createSSEStream() {
    const encoder = new TextEncoder();
    let controller: ReadableStreamDefaultController<Uint8Array>;

    const stream = new ReadableStream<Uint8Array>({
        start(c) {
            controller = c;
        },
    });

    const send = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
    };

    const close = () => {
        controller.close();
    };

    return { stream, send, close };
}

function sseResponse(stream: ReadableStream<Uint8Array>) {
    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}

// ═══════════════════════════════════════════════════════════════
// Gemini Implementation
// ═══════════════════════════════════════════════════════════════

async function handleGeminiStreaming(
    messages: { role: string; content: string }[],
    images: { mimeType: string; data: string }[] | undefined,
    send: (event: string, data: unknown) => void
) {
    const {
        genai,
        QUOTE_ASSISTANT_MODEL,
        priceLookupDeclaration,
        generateQuoteDeclaration,
    } = await import("@/server/services/gemini");

    // Build Gemini-compatible content array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contents: any[] = [];
    for (const msg of messages) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parts: any[] = [{ text: msg.content }];
        if (
            msg === messages[messages.length - 1] &&
            msg.role === "user" &&
            images?.length
        ) {
            for (const img of images) {
                parts.push({
                    inlineData: { mimeType: img.mimeType, data: img.data },
                });
            }
            if (!msg.content || msg.content === "[Image upload]") {
                parts[0] = {
                    text: "Analiza esta imagen del proyecto y dime qué trabajo se necesita, qué materiales serían necesarios, y cualquier observación relevante para la cotización.",
                };
            }
        }
        contents.push({
            role: msg.role === "user" ? "user" : "model",
            parts,
        });
    }

    const geminiConfig = {
        systemInstruction: SYSTEM_PROMPT,
        tools: [
            {
                functionDeclarations: [
                    priceLookupDeclaration,
                    generateQuoteDeclaration,
                ],
            },
        ],
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
    };

    // Helper with retry for rate limits
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const callWithRetry = async (callFn: () => Promise<any>, maxRetries = 3) => {
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await callFn();
            } catch (error: unknown) {
                const isRateLimit =
                    error instanceof Error &&
                    (error.message.includes("429") || error.message.includes("RESOURCE_EXHAUSTED"));
                if (isRateLimit && attempt < maxRetries) {
                    const delay = Math.pow(2, attempt + 1) * 1000;
                    console.log(`Gemini rate limited. Retrying in ${delay / 1000}s...`);
                    send("status", { message: `⏳ Esperando ${delay / 1000}s por rate limit...` });
                    await new Promise((r) => setTimeout(r, delay));
                    continue;
                }
                throw error;
            }
        }
    };

    send("status", { message: "🤖 Procesando con Gemini Flash..." });

    const response = await callWithRetry(() =>
        genai.models.generateContent({
            model: QUOTE_ASSISTANT_MODEL,
            contents,
            config: geminiConfig,
        })
    );

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) {
        send("text-delta", {
            delta: "No pude generar una respuesta. Por favor intenta de nuevo.",
        });
        return;
    }

    let hasText = false;
    const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

    for (const part of candidate.content.parts) {
        if (part.text) {
            send("text-delta", { delta: part.text });
            hasText = true;
        }
        if (part.functionCall) {
            functionCalls.push({
                name: part.functionCall.name || "",
                args: (part.functionCall.args as Record<string, unknown>) || {},
            });
        }
    }

    // Handle function calls
    for (const fc of functionCalls) {
        if (fc.name === "search_material_prices") {
            send("status", { message: "🔍 Buscando precios de materiales..." });
            const materials = (fc.args.materials as Array<{ name: string; quantity: number; unit: string }>) || [];
            const prices = await searchMaterialPrices(materials);
            send("prices", { prices });

            // Follow up with price results
            const followUpContents = [
                ...contents,
                { role: "model", parts: candidate.content.parts },
                {
                    role: "user",
                    parts: [
                        {
                            functionResponse: {
                                name: "search_material_prices",
                                response: { result: prices },
                            },
                        },
                    ],
                },
            ];

            send("status", { message: "💡 Analizando precios..." });
            send("text-clear", {});

            const followUp = await callWithRetry(() =>
                genai.models.generateContent({
                    model: QUOTE_ASSISTANT_MODEL,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    contents: followUpContents as any,
                    config: geminiConfig,
                })
            );

            const followUpCandidate = followUp.candidates?.[0];
            if (followUpCandidate?.content?.parts) {
                for (const part of followUpCandidate.content.parts) {
                    if (part.text) send("text-delta", { delta: part.text });
                    if (part.functionCall?.name === "generate_quote_data") {
                        send("status", { message: "📝 Generando cotización..." });
                        send("quote", { data: part.functionCall.args });
                    }
                }
            }
        } else if (fc.name === "generate_quote_data") {
            send("status", { message: "📝 Generando cotización..." });
            send("quote", { data: fc.args });

            if (!hasText) {
                const followUpContents = [
                    ...contents,
                    { role: "model", parts: candidate.content.parts },
                    {
                        role: "user",
                        parts: [
                            {
                                functionResponse: {
                                    name: "generate_quote_data",
                                    response: { result: { success: true } },
                                },
                            },
                        ],
                    },
                ];

                const followUp = await callWithRetry(() =>
                    genai.models.generateContent({
                        model: QUOTE_ASSISTANT_MODEL,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        contents: followUpContents as any,
                        config: geminiConfig,
                    })
                );

                const followUpCandidate = followUp.candidates?.[0];
                if (followUpCandidate?.content?.parts) {
                    for (const part of followUpCandidate.content.parts) {
                        if (part.text) send("text-delta", { delta: part.text });
                    }
                }
            }
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// OpenAI GPT-4o Implementation
// ═══════════════════════════════════════════════════════════════

async function handleOpenAIStreaming(
    messages: { role: string; content: string }[],
    images: { mimeType: string; data: string }[] | undefined,
    send: (event: string, data: unknown) => void
) {
    const { openai, GPT4O_MODEL, openaiTools } = await import(
        "@/server/services/openai"
    );

    // Build OpenAI message array
    const openaiMessages: Array<{
        role: "system" | "user" | "assistant" | "tool";
        content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
        tool_call_id?: string;
    }> = [
            { role: "system", content: SYSTEM_PROMPT },
        ];

    for (const msg of messages) {
        if (
            msg === messages[messages.length - 1] &&
            msg.role === "user" &&
            images?.length
        ) {
            // Multimodal message with images
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const content: any[] = [];
            if (msg.content && msg.content !== "[Image upload]") {
                content.push({ type: "text", text: msg.content });
            } else {
                content.push({
                    type: "text",
                    text: "Analiza esta imagen del proyecto y dime qué trabajo se necesita, qué materiales serían necesarios, y cualquier observación relevante para la cotización.",
                });
            }
            for (const img of images) {
                content.push({
                    type: "image_url",
                    image_url: {
                        url: `data:${img.mimeType};base64,${img.data}`,
                    },
                });
            }
            openaiMessages.push({
                role: "user",
                content,
            });
        } else {
            openaiMessages.push({
                role: msg.role === "user" ? "user" : "assistant",
                content: msg.content,
            });
        }
    }

    send("status", { message: "🤖 Procesando con GPT-4o..." });

    // Call GPT-4o with tool support and agentic loop
    let loopCount = 0;
    const maxLoops = 5;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response = await openai.chat.completions.create({
        model: GPT4O_MODEL,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        messages: openaiMessages as any,
        tools: openaiTools,
        temperature: 0.7,
        max_tokens: 4096,
    });

    // Agentic tool-use loop
    while (
        response.choices[0]?.finish_reason === "tool_calls" &&
        loopCount < maxLoops
    ) {
        loopCount++;
        const assistantMessage = response.choices[0].message;

        // Collect any text content
        if (assistantMessage.content) {
            send("text-delta", { delta: assistantMessage.content });
        }

        // Process tool calls
        const toolCalls = assistantMessage.tool_calls || [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toolMessages: any[] = [
            {
                role: "assistant" as const,
                content: assistantMessage.content,
                tool_calls: assistantMessage.tool_calls,
            },
        ];

        for (const toolCall of toolCalls) {
            if (toolCall.type !== "function") continue;
            const fnName = toolCall.function.name;
            const fnArgs = JSON.parse(toolCall.function.arguments);

            if (fnName === "search_material_prices") {
                send("status", { message: "🔍 Buscando precios de materiales..." });
                const prices = await searchMaterialPrices(fnArgs.materials || []);
                send("prices", { prices });

                toolMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify(prices),
                });
            } else if (fnName === "generate_quote_data") {
                send("status", { message: "📝 Generando cotización..." });
                send("quote", { data: fnArgs });

                toolMessages.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: JSON.stringify({ success: true, message: "Quote generated" }),
                });
            }
        }

        // Continue conversation with tool results
        openaiMessages.push(...toolMessages);
        send("status", { message: "💡 Analizando resultados..." });
        send("text-clear", {});

        response = await openai.chat.completions.create({
            model: GPT4O_MODEL,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            messages: openaiMessages as any,
            tools: openaiTools,
            temperature: 0.7,
            max_tokens: 4096,
        });
    }

    // Final text output
    const finalContent = response.choices[0]?.message?.content;
    if (finalContent) {
        send("text-delta", { delta: finalContent });
    }

    // Handle any remaining tool calls in the final response
    const finalToolCalls = response.choices[0]?.message?.tool_calls || [];
    for (const toolCall of finalToolCalls) {
        if (toolCall.type !== "function") continue;
        const fnName = toolCall.function.name;
        const fnArgs = JSON.parse(toolCall.function.arguments);

        if (fnName === "search_material_prices") {
            send("status", { message: "🔍 Buscando precios de materiales..." });
            const prices = await searchMaterialPrices(fnArgs.materials || []);
            send("prices", { prices });
        } else if (fnName === "generate_quote_data") {
            send("status", { message: "📝 Generando cotización..." });
            send("quote", { data: fnArgs });
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// Main POST Handler
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
    const authData = await auth();
    if (!authData.userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const body = await req.json();
        const { messages, images, stream: useStreaming } = body as {
            messages: { role: "user" | "assistant"; content: string }[];
            images?: { mimeType: string; data: string }[];
            stream?: boolean;
        };

        const provider = getActiveProvider();
        console.log(`[AI Chat] Using provider: ${provider}`);

        if (useStreaming) {
            const { stream, send, close } = createSSEStream();

            (async () => {
                try {
                    if (provider === "openai") {
                        await handleOpenAIStreaming(messages, images, send);
                    } else {
                        await handleGeminiStreaming(messages, images, send);
                    }
                    send("done", {});
                } catch (error) {
                    console.error(`AI Streaming Error (${provider}):`, error);
                    const isRateLimit =
                        error instanceof Error &&
                        (error.message.includes("429") ||
                            error.message.includes("RESOURCE_EXHAUSTED") ||
                            error.message.includes("rate_limit"));
                    send("error", {
                        message: isRateLimit
                            ? `⏳ Límite de solicitudes alcanzado (${provider}). Espera unos segundos e intenta de nuevo.`
                            : `Hubo un error con ${provider}: ${error instanceof Error ? error.message : "Error desconocido"}`,
                    });
                } finally {
                    close();
                }
            })();

            return sseResponse(stream);
        }

        // ── NON-STREAMING FALLBACK ──
        // For simplicity, redirect to streaming mode internally
        // This ensures consistent behavior regardless of streaming flag
        return new Response(
            JSON.stringify({
                text: "Por favor habilita streaming para mejor experiencia.",
                functionCalls: [],
            }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("AI Chat Error:", error);
        return Response.json(
            {
                error: "Error procesando la solicitud de IA",
                text: `Hubo un error: ${error instanceof Error ? error.message : "Error desconocido"}`,
                functionCalls: [],
            },
            { status: 500 }
        );
    }
}
