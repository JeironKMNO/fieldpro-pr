import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { getActiveProvider } from "../services/ai-provider";

export const materialRouter = router({
  getByJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
        select: { id: true },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      const list = await ctx.db.materialList.findUnique({
        where: { jobId: input.jobId },
        include: {
          items: { orderBy: { sortOrder: "asc" } },
        },
      });

      return list;
    }),

  generate: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 1. Fetch job with quote items
      const job = await ctx.db.job.findFirst({
        where: { id: input.jobId, organizationId: ctx.auth.organizationId },
        include: {
          quote: {
            include: {
              sections: {
                include: {
                  category: { select: { name: true } },
                  items: true,
                },
              },
            },
          },
        },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (!job.quote) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This job has no quote to generate materials from",
        });
      }

      // 2. Build quote items summary for AI
      const quoteItems = job.quote.sections.flatMap((section) =>
        section.items.map((item) => ({
          category: section.category.name,
          description: item.description,
          quantity: Number(item.quantity),
          unitType: item.unitType,
          unitPrice: Number(item.unitPrice),
        }))
      );

      if (quoteItems.length === 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Quote has no items to analyze",
        });
      }

      // 3. Call AI to extract materials
      const materials = await extractMaterialsWithAI(quoteItems);

      if (materials.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "AI could not extract materials from the quote items. Try again.",
        });
      }

      // 4. Upsert material list (delete existing items if regenerating)
      const existing = await ctx.db.materialList.findUnique({
        where: { jobId: input.jobId },
      });

      if (existing) {
        await ctx.db.materialItem.deleteMany({
          where: { materialListId: existing.id },
        });

        await ctx.db.materialItem.createMany({
          data: materials.map((m, i) => ({
            materialListId: existing.id,
            name: m.name,
            quantity: m.quantity,
            unit: m.unit,
            estimatedPrice: m.estimatedPrice ?? null,
            store: m.store ?? null,
            sortOrder: i,
          })),
        });

        return ctx.db.materialList.findUnique({
          where: { id: existing.id },
          include: { items: { orderBy: { sortOrder: "asc" } } },
        });
      }

      return ctx.db.materialList.create({
        data: {
          organizationId: ctx.auth.organizationId,
          jobId: input.jobId,
          items: {
            create: materials.map((m, i) => ({
              name: m.name,
              quantity: m.quantity,
              unit: m.unit,
              estimatedPrice: m.estimatedPrice ?? null,
              store: m.store ?? null,
              sortOrder: i,
            })),
          },
        },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      });
    }),

  togglePurchased: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.materialItem.findUnique({
        where: { id: input.itemId },
        include: {
          materialList: { select: { organizationId: true } },
        },
      });

      if (!item || item.materialList.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return ctx.db.materialItem.update({
        where: { id: input.itemId },
        data: { purchased: !item.purchased },
      });
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        materialListId: z.string(),
        name: z.string().min(1),
        quantity: z.number().positive(),
        unit: z.string().min(1),
        estimatedPrice: z.number().positive().optional(),
        store: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.db.materialList.findUnique({
        where: { id: input.materialListId },
        select: { organizationId: true, _count: { select: { items: true } } },
      });

      if (!list || list.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "List not found" });
      }

      return ctx.db.materialItem.create({
        data: {
          materialListId: input.materialListId,
          name: input.name,
          quantity: input.quantity,
          unit: input.unit,
          estimatedPrice: input.estimatedPrice ?? null,
          store: input.store ?? null,
          notes: input.notes ?? null,
          sortOrder: list._count.items,
        },
      });
    }),

  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.materialItem.findUnique({
        where: { id: input.itemId },
        include: {
          materialList: { select: { organizationId: true } },
        },
      });

      if (!item || item.materialList.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return ctx.db.materialItem.delete({ where: { id: input.itemId } });
    }),

  updateItem: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        name: z.string().min(1).optional(),
        quantity: z.number().positive().optional(),
        unit: z.string().min(1).optional(),
        estimatedPrice: z.number().positive().nullish(),
        store: z.string().nullish(),
        notes: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.materialItem.findUnique({
        where: { id: input.itemId },
        include: {
          materialList: { select: { organizationId: true } },
        },
      });

      if (!item || item.materialList.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const { itemId, ...data } = input;
      return ctx.db.materialItem.update({
        where: { id: itemId },
        data,
      });
    }),
});

// ─── AI Material Extraction ────────────────────────────

interface ExtractedMaterial {
  name: string;
  quantity: number;
  unit: string;
  estimatedPrice?: number;
  store?: string;
}

interface QuoteItemSummary {
  category: string;
  description: string;
  quantity: number;
  unitType: string;
  unitPrice: number;
}

async function extractMaterialsWithAI(
  quoteItems: QuoteItemSummary[]
): Promise<ExtractedMaterial[]> {
  const prompt = `You are a helpful project management assistant for a construction company in Puerto Rico. Your task is to create a SHOPPING LIST of raw materials that can be purchased at hardware stores.

CRITICAL RULES:
1. Only list materials you can actually BUY at a store (cement bags, rebar, lumber, PVC pipe, paint, tiles, screws, etc.)
2. NEVER list finished structures as materials. For example:
   - "Columnas de concreto 6x6" is NOT a material — break it down into: cement bags, rebar, formwork lumber, wire ties
   - "Losa de concreto 4 pulgadas" is NOT a material — break it down into: cement bags, gravel, sand, welded wire mesh, rebar
   - "Techo de pérgola aluminio" is NOT a material — list: aluminum pergola kit or aluminum beams/posts
3. Skip pure labor items (demolition labor, installation labor, removal)
4. Estimate realistic quantities based on the dimensions and scope described
5. Use Puerto Rico market prices in USD

For each material:
- name: specific purchasable product name in Spanish (e.g., "Cemento Portland 94lb", "Varilla #4 20ft", "Grava 3/4\"")
- quantity: how many units to buy (number)
- unit: unit of measure ("sacos", "piezas", "pies", "galones", "cajas", "yardas cúbicas")
- estimatedPrice: approximate unit cost in USD
- store: suggested store ("Home Depot", "Lowe's", "Ferretería local", "Sherwin-Williams", "Centro de Materiales")

Project quote line items:
${JSON.stringify(quoteItems, null, 2)}

Return a JSON object with a "materials" key containing an array. Example:
{"materials":[{"name":"Cemento Portland 94lb","quantity":45,"unit":"sacos","estimatedPrice":12.50,"store":"Home Depot"},{"name":"Varilla corrugada #4 20ft","quantity":20,"unit":"piezas","estimatedPrice":8.75,"store":"Ferretería local"}]}`;

  const provider = getActiveProvider();

  if (provider === "openai") {
    return extractWithOpenAI(prompt);
  }
  return extractWithGemini(prompt);
}

async function extractWithOpenAI(prompt: string): Promise<ExtractedMaterial[]> {
  const { openai, GPT4O_MODEL } = await import("../services/openai");

  try {
    const response = await openai.chat.completions.create({
      model: GPT4O_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a helpful construction project assistant that creates material shopping lists from project quotes. Always respond with valid JSON.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return extractWithGemini(prompt);
    }

    return parseMaterialsJSON(content);
  } catch (err) {
    console.error("[material.generate] OpenAI error:", err);
    return extractWithGemini(prompt);
  }
}

async function extractWithGemini(prompt: string): Promise<ExtractedMaterial[]> {
  const { genai, QUOTE_ASSISTANT_MODEL } = await import("../services/gemini");

  try {
    const response = await genai.models.generateContent({
      model: QUOTE_ASSISTANT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    const content = response.text;
    if (!content) return [];

    return parseMaterialsJSON(content);
  } catch (err) {
    console.error("[material.generate] Gemini error:", err);
    return [];
  }
}

function parseMaterialsJSON(raw: string): ExtractedMaterial[] {
  try {
    const parsed = JSON.parse(raw);

    // Handle array directly, or any wrapper object with an array value
    let arr: unknown[];
    if (Array.isArray(parsed)) {
      arr = parsed;
    } else if (typeof parsed === "object" && parsed !== null) {
      // Find the first array property (OpenAI wraps in { "materials": [...] } or any key)
      const values = Object.values(parsed as Record<string, unknown>);
      const found = values.find((v) => Array.isArray(v));
      arr = (found as unknown[]) ?? [];
    } else {
      return [];
    }

    if (!Array.isArray(arr)) return [];

    return (arr as Record<string, unknown>[])
      .filter(
        (m) =>
          typeof m.name === "string" && m.name.trim() !== ""
      )
      .map((m, i) => {
        // Handle both camelCase and snake_case from AI
        const price = m.estimatedPrice ?? m.estimated_price ?? m.price ?? m.unitPrice ?? m.unit_price;
        return {
          name: String(m.name).trim(),
          quantity: typeof m.quantity === "number" && m.quantity > 0 ? m.quantity : 1,
          unit: typeof m.unit === "string" ? m.unit : "unit",
          estimatedPrice:
            typeof price === "number" && price > 0 ? price : undefined,
          store: typeof m.store === "string" ? m.store : undefined,
          sortOrder: i,
        };
      });
  } catch {
    return [];
  }
}
