import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@fieldpro/db";
import { getActiveProvider } from "@/server/services/ai-provider";
import { buildAgentSystemPrompt } from "@/server/services/agent-system-prompt";
import {
  agentToolDeclarations,
  agentOpenAITools,
  executeAgentTool,
  type AgentToolContext,
  type PreviewPayload,
} from "@/server/services/agent-tools";

export const maxDuration = 60;

// ═══════════════════════════════════════════════════════════════
// SSE Helpers (same pattern as /api/ai/chat)
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
// Gemini Agent Handler
// ═══════════════════════════════════════════════════════════════

async function handleGeminiAgent(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  toolCtx: AgentToolContext,
  send: (event: string, data: unknown) => void
): Promise<string> {
  const { genai, QUOTE_ASSISTANT_MODEL } =
    await import("@/server/services/gemini");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const contents: any[] = messages.map((msg) => ({
    role: msg.role === "user" ? "user" : "model",
    parts: [{ text: msg.content }],
  }));

  const geminiConfig = {
    systemInstruction: systemPrompt,
    tools: [{ functionDeclarations: agentToolDeclarations }],
    temperature: 0.4,
    maxOutputTokens: 4096,
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const callWithRetry = async (callFn: () => Promise<any>, maxRetries = 3) => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await callFn();
      } catch (error: unknown) {
        const isRateLimit =
          error instanceof Error &&
          (error.message.includes("429") ||
            error.message.includes("RESOURCE_EXHAUSTED"));
        if (isRateLimit && attempt < maxRetries) {
          const delay = Math.pow(2, attempt + 1) * 1000;
          send("status", { message: `⏳ Esperando ${delay / 1000}s...` });
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }
        throw error;
      }
    }
  };

  send("status", { message: "🤖 Procesando con Gemini..." });

  let fullResponse = "";
  let loopCount = 0;
  const maxLoops = 8;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentContents: any[] = [...contents];

  while (loopCount < maxLoops) {
    loopCount++;

    const response = await callWithRetry(() =>
      genai.models.generateContent({
        model: QUOTE_ASSISTANT_MODEL,
        contents: currentContents,
        config: geminiConfig,
      })
    );

    const candidate = response.candidates?.[0];
    if (!candidate?.content?.parts) break;

    const functionCalls: Array<{
      name: string;
      args: Record<string, unknown>;
    }> = [];

    for (const part of candidate.content.parts) {
      if (part.text) {
        send("text-delta", { delta: part.text });
        fullResponse += part.text;
      }
      if (part.functionCall) {
        functionCalls.push({
          name: part.functionCall.name || "",
          args: (part.functionCall.args as Record<string, unknown>) || {},
        });
      }
    }

    if (functionCalls.length === 0) break;

    // Execute tools
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const functionResponses: any[] = [];

    for (const fc of functionCalls) {
      try {
        const toolResult = await executeAgentTool(fc.name, fc.args, toolCtx);
        send("status", { message: toolResult.statusMessage });
        if (toolResult.preview) {
          send("preview", toolResult.preview);
        }
        functionResponses.push({
          functionResponse: {
            name: fc.name,
            response: { result: toolResult.result },
          },
        });
      } catch (err) {
        functionResponses.push({
          functionResponse: {
            name: fc.name,
            response: {
              error: err instanceof Error ? err.message : "Error desconocido",
            },
          },
        });
      }
    }

    // Continue with function responses
    currentContents = [
      ...currentContents,
      { role: "model", parts: candidate.content.parts },
      { role: "user", parts: functionResponses },
    ];

    send("text-clear", {});
    fullResponse = "";
    send("status", { message: "💡 Procesando resultado..." });
  }

  return fullResponse;
}

// ═══════════════════════════════════════════════════════════════
// OpenAI Agent Handler
// ═══════════════════════════════════════════════════════════════

async function handleOpenAIAgent(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  toolCtx: AgentToolContext,
  send: (event: string, data: unknown) => void
): Promise<string> {
  const { openai, GPT4O_MODEL } = await import("@/server/services/openai");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openaiMessages: any[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    })),
  ];

  send("status", { message: "🤖 Procesando con GPT-4o..." });

  let fullResponse = "";
  let loopCount = 0;
  const maxLoops = 8;

  let response = await openai.chat.completions.create({
    model: GPT4O_MODEL,
    messages: openaiMessages,
    tools: agentOpenAITools,
    temperature: 0.4,
    max_tokens: 4096,
  });

  while (loopCount < maxLoops) {
    loopCount++;
    const choice = response.choices[0];
    if (!choice) break;

    if (choice.message.content) {
      send("text-delta", { delta: choice.message.content });
      fullResponse += choice.message.content;
    }

    if (choice.finish_reason !== "tool_calls") break;

    const toolCalls = choice.message.tool_calls || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolMessages: any[] = [
      {
        role: "assistant",
        content: choice.message.content,
        tool_calls: choice.message.tool_calls,
      },
    ];

    for (const toolCall of toolCalls) {
      if (toolCall.type !== "function") continue;
      const fnName = toolCall.function.name;
      const fnArgs = JSON.parse(toolCall.function.arguments) as Record<
        string,
        unknown
      >;

      try {
        const toolResult = await executeAgentTool(fnName, fnArgs, toolCtx);
        send("status", { message: toolResult.statusMessage });
        if (toolResult.preview) {
          send("preview", toolResult.preview);
        }
        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult.result),
        });
      } catch (err) {
        toolMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            error: err instanceof Error ? err.message : "Error",
          }),
        });
      }
    }

    openaiMessages.push(...toolMessages);
    send("text-clear", {});
    fullResponse = "";
    send("status", { message: "💡 Procesando resultado..." });

    response = await openai.chat.completions.create({
      model: GPT4O_MODEL,
      messages: openaiMessages,
      tools: agentOpenAITools,
      temperature: 0.4,
      max_tokens: 4096,
    });
  }

  const finalContent = response.choices[0]?.message?.content;
  if (finalContent) {
    send("text-delta", { delta: finalContent });
    fullResponse += finalContent;
  }

  return fullResponse;
}

// ═══════════════════════════════════════════════════════════════
// Main POST Handler
// ═══════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
  const authData = await auth();
  if (!authData.userId || !authData.orgId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { messages, conversationId } = body as {
      messages: { role: "user" | "assistant"; content: string }[];
      conversationId: string;
    };

    if (!conversationId) {
      return new Response(
        JSON.stringify({ error: "conversationId required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Resolve internal org
    const org = await prisma.organization.findFirst({
      where: { clerkId: authData.orgId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        phone: true,
        license: true,
      },
    });

    if (!org) {
      return new Response(JSON.stringify({ error: "Organization not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build tool context
    const toolCtx: AgentToolContext = {
      organizationId: org.id,
      clerkUserId: authData.userId,
      db: prisma,
      org: {
        name: org.name,
        logoUrl: org.logoUrl,
        phone: org.phone,
        license: org.license,
      },
    };

    // Save user message
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg?.role === "user") {
      await prisma.agentMessage.create({
        data: {
          conversationId,
          role: "user",
          content: lastUserMsg.content,
        },
      });
    }

    // Quick stats for system prompt context
    const [activeClients, openQuotes, activeJobs, pendingInvoices] =
      await Promise.all([
        prisma.client.count({
          where: { organizationId: org.id, status: "ACTIVE" },
        }),
        prisma.quote.count({
          where: { organizationId: org.id, status: { in: ["SENT", "VIEWED"] } },
        }),
        prisma.job.count({
          where: {
            organizationId: org.id,
            status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          },
        }),
        prisma.invoice.count({
          where: {
            organizationId: org.id,
            status: { in: ["SENT", "VIEWED", "OVERDUE"] },
          },
        }),
      ]);

    const systemPrompt = buildAgentSystemPrompt({
      orgName: org.name,
      recentStats: { activeClients, openQuotes, activeJobs, pendingInvoices },
    });

    const provider = getActiveProvider();
    const { stream, send, close } = createSSEStream();

    (async () => {
      let fullResponse = "";
      try {
        if (provider === "openai") {
          fullResponse = await handleOpenAIAgent(
            messages,
            systemPrompt,
            toolCtx,
            send
          );
        } else {
          fullResponse = await handleGeminiAgent(
            messages,
            systemPrompt,
            toolCtx,
            send
          );
        }
        send("done", {});
      } catch (error) {
        console.error(`[Agent] Error (${provider}):`, error);

        // Fallback to OpenAI if Gemini fails
        if (provider === "gemini" && process.env.OPENAI_API_KEY) {
          try {
            send("status", { message: "⚠️ Usando GPT-4o como respaldo..." });
            fullResponse = await handleOpenAIAgent(
              messages,
              systemPrompt,
              toolCtx,
              send
            );
            send("done", {});
          } catch (fallbackError) {
            console.error("[Agent] Fallback also failed:", fallbackError);
            send("error", { message: "Hubo un error. Intenta de nuevo." });
          }
        } else {
          const isRateLimit =
            error instanceof Error &&
            (error.message.includes("429") ||
              error.message.includes("RESOURCE_EXHAUSTED"));
          send("error", {
            message: isRateLimit
              ? "⏳ Límite de solicitudes alcanzado. Espera unos segundos."
              : "Hubo un error al procesar tu solicitud.",
          });
        }
      } finally {
        // Save assistant response
        if (fullResponse.trim()) {
          await prisma.agentMessage.create({
            data: {
              conversationId,
              role: "assistant",
              content: fullResponse.trim(),
            },
          });
        }

        // Auto-title on first exchange
        const conv = await prisma.agentConversation.findUnique({
          where: { id: conversationId },
          select: { title: true },
        });
        if (!conv?.title && lastUserMsg?.content) {
          const autoTitle = lastUserMsg.content.slice(0, 60).trim();
          await prisma.agentConversation.update({
            where: { id: conversationId },
            data: { title: autoTitle },
          });
        } else {
          // Touch updatedAt
          await prisma.agentConversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });
        }

        close();
      }
    })();

    return sseResponse(stream);
  } catch (error) {
    console.error("[Agent] Request error:", error);
    return Response.json(
      { error: "Error procesando la solicitud" },
      { status: 500 }
    );
  }
}
