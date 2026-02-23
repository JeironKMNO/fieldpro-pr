import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma, type PrismaClient } from "@fieldpro/db";
import { router, protectedProcedure } from "../trpc";
import { getTemplateById } from "@/lib/quote-templates";

const DEFAULT_CATEGORIES = [
  { name: "Demolicion", sortOrder: 1 },
  { name: "Estructura", sortOrder: 2 },
  { name: "Plomeria", sortOrder: 3 },
  { name: "Electrico", sortOrder: 4 },
  { name: "Techado", sortOrder: 5 },
  { name: "Piso", sortOrder: 6 },
  { name: "Pintura", sortOrder: 7 },
  { name: "Acabados", sortOrder: 8 },
  { name: "Ventanas/Puertas", sortOrder: 9 },
  { name: "Otros", sortOrder: 10 },
];

function calculateItemTotal(
  unitType: string,
  length: number | null,
  width: number | null,
  height: number | null,
  manualQuantity: number,
  unitPrice: number,
  markupPct: number
): { quantity: number; total: number } {
  let quantity = manualQuantity;

  if (length && width) {
    if (unitType === "CUBIC_YD" && height) {
      quantity = (length * width * height) / 27;
    } else {
      quantity = length * width;
    }
  }

  const total = quantity * unitPrice * (1 + markupPct / 100);
  return {
    quantity: Math.round(quantity * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

async function recalculateQuoteTotals(db: PrismaClient, quoteId: string) {
  const sections = await db.quoteSection.findMany({
    where: { quoteId },
    include: { items: true },
  });

  let subtotal = 0;

  for (const section of sections) {
    const sectionSubtotal = section.items.reduce(
      (sum: number, item: { total: Prisma.Decimal }) =>
        sum + Number(item.total),
      0
    );
    await db.quoteSection.update({
      where: { id: section.id },
      data: { subtotal: sectionSubtotal },
    });
    subtotal += sectionSubtotal;
  }

  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    select: { taxRate: true },
  });

  const taxRate = Number(quote?.taxRate ?? 0);
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  await db.quote.update({
    where: { id: quoteId },
    data: {
      subtotal,
      taxAmount,
      total,
    },
  });
}

const categoryRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    let categories = await ctx.db.quoteCategory.findMany({
      where: { organizationId: ctx.auth.organizationId },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { sections: true } } },
    });

    // Auto-seed defaults if org has no categories
    if (categories.length === 0) {
      await ctx.db.quoteCategory.createMany({
        data: DEFAULT_CATEGORIES.map((c) => ({
          ...c,
          organizationId: ctx.auth.organizationId,
          isDefault: true,
        })),
        skipDuplicates: true,
      });
      categories = await ctx.db.quoteCategory.findMany({
        where: { organizationId: ctx.auth.organizationId },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { sections: true } } },
      });
    }

    return categories;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        sortOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.quoteCategory.create({
        data: {
          organizationId: ctx.auth.organizationId,
          name: input.name,
          sortOrder: input.sortOrder ?? 99,
        },
      });
    }),
});

export const quoteRouter = router({
  categories: categoryRouter,

  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z
          .enum(["DRAFT", "SENT", "VIEWED", "ACCEPTED", "REJECTED", "EXPIRED"])
          .optional(),
        clientId: z.string().optional(),
        sortBy: z
          .enum(["createdAt", "quoteNumber", "total"])
          .default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, clientId, sortBy, sortOrder } =
        input;
      const skip = (page - 1) * limit;

      const where: Prisma.QuoteWhereInput = {
        organizationId: ctx.auth.organizationId,
        ...(status && { status }),
        ...(clientId && { clientId }),
        ...(search && {
          OR: [
            {
              quoteNumber: { contains: search, mode: "insensitive" as const },
            },
            {
              client: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
            { title: { contains: search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [quotes, total] = await Promise.all([
        ctx.db.quote.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          include: {
            client: { select: { name: true } },
            _count: { select: { sections: true } },
          },
        }),
        ctx.db.quote.count({ where }),
      ]);

      return {
        quotes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    }),

  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const quote = await ctx.db.quote.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.auth.organizationId,
        },
        include: {
          client: {
            include: {
              addresses: { where: { isPrimary: true }, take: 1 },
            },
          },
          createdBy: {
            select: { firstName: true, lastName: true },
          },
          organization: {
            select: { name: true, logoUrl: true, phone: true, license: true },
          },
          sections: {
            orderBy: { sortOrder: "asc" },
            include: {
              category: true,
              items: { orderBy: { sortOrder: "asc" } },
            },
          },
          activities: {
            orderBy: { createdAt: "asc" },
          },
          job: {
            select: { id: true, jobNumber: true, status: true },
          },
        },
      });

      if (!quote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Quote not found",
        });
      }

      return quote;
    }),

  create: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        title: z.string().optional(),
        taxRate: z.number().min(0).max(1).default(0.115),
        validUntil: z.date().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get user's internal DB id
      const user = await ctx.db.user.findFirst({
        where: {
          clerkId: ctx.auth.userId,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found in database",
        });
      }

      // Verify client belongs to org
      const client = await ctx.db.client.findFirst({
        where: {
          id: input.clientId,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Client not found",
        });
      }

      // Atomic quote number increment
      const counter = await ctx.db.quoteCounter.upsert({
        where: { organizationId: ctx.auth.organizationId },
        update: { lastNumber: { increment: 1 } },
        create: { organizationId: ctx.auth.organizationId, lastNumber: 1 },
      });

      const quoteNumber = `QT-${String(counter.lastNumber).padStart(3, "0")}`;

      return ctx.db.quote.create({
        data: {
          organizationId: ctx.auth.organizationId,
          clientId: input.clientId,
          createdById: user.id,
          quoteNumber,
          title: input.title,
          taxRate: input.taxRate,
          validUntil: input.validUntil,
          notes: input.notes,
        },
      });
    }),

  createFromTemplate: protectedProcedure
    .input(
      z.object({
        clientId: z.string(),
        templateId: z.string(),
        title: z.string().optional(),
        taxRate: z.number().min(0).max(1).default(0.115),
        validDays: z.number().min(1).default(30),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const template = getTemplateById(input.templateId);
      if (!template) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Template not found",
        });
      }

      const user = await ctx.db.user.findFirst({
        where: {
          clerkId: ctx.auth.userId,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found in database",
        });
      }

      const client = await ctx.db.client.findFirst({
        where: {
          id: input.clientId,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (!client) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Client not found" });
      }

      // Generate quote number
      const counter = await ctx.db.quoteCounter.upsert({
        where: { organizationId: ctx.auth.organizationId },
        update: { lastNumber: { increment: 1 } },
        create: { organizationId: ctx.auth.organizationId, lastNumber: 1 },
      });
      const quoteNumber = `QT-${String(counter.lastNumber).padStart(3, "0")}`;

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + input.validDays);

      // Build sections with items and calculate totals
      let subtotal = 0;
      const sectionsData: Prisma.QuoteSectionCreateWithoutQuoteInput[] = [];

      for (let si = 0; si < template.sections.length; si++) {
        const sec = template.sections[si];

        // Upsert category for this org
        const category = await ctx.db.quoteCategory.upsert({
          where: {
            organizationId_name: {
              organizationId: ctx.auth.organizationId,
              name: sec.category,
            },
          },
          update: {},
          create: {
            organizationId: ctx.auth.organizationId,
            name: sec.category,
            sortOrder: si,
          },
        });

        let sectionSubtotal = 0;
        const itemsData = sec.items.map((item, ii) => {
          const { quantity, total } = calculateItemTotal(
            item.unitType,
            null,
            null,
            null,
            item.quantity,
            item.unitPrice,
            item.markupPct
          );
          sectionSubtotal += total;
          return {
            description: item.description,
            unitType: item.unitType,
            quantity,
            unitPrice: item.unitPrice,
            markupPct: item.markupPct,
            total,
            sortOrder: ii,
          };
        });

        subtotal += sectionSubtotal;

        sectionsData.push({
          category: { connect: { id: category.id } },
          sortOrder: si,
          subtotal: sectionSubtotal,
          items: { create: itemsData },
        });
      }

      const taxAmount = Math.round(subtotal * input.taxRate * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;

      return ctx.db.quote.create({
        data: {
          organizationId: ctx.auth.organizationId,
          clientId: input.clientId,
          createdById: user.id,
          quoteNumber,
          title: input.title ?? template.name,
          taxRate: input.taxRate,
          validUntil,
          notes: input.notes ?? template.defaultNotes,
          subtotal,
          taxAmount,
          total,
          sections: { create: sectionsData },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        taxRate: z.number().min(0).max(1).optional(),
        validUntil: z.date().nullable().optional(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const quote = await ctx.db.quote.findFirst({
        where: { id, organizationId: ctx.auth.organizationId },
      });

      if (!quote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      if (quote.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft quotes can be edited",
        });
      }

      const updated = await ctx.db.quote.update({
        where: { id },
        data,
      });

      // Recalculate if tax rate changed
      if (data.taxRate !== undefined) {
        await recalculateQuoteTotals(ctx.db, id);
      }

      return updated;
    }),

  addSection: protectedProcedure
    .input(
      z.object({
        quoteId: z.string(),
        categoryId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quote = await ctx.db.quote.findFirst({
        where: {
          id: input.quoteId,
          organizationId: ctx.auth.organizationId,
        },
        include: { sections: true },
      });

      if (!quote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      const nextSort =
        quote.sections.length > 0
          ? Math.max(...quote.sections.map((s) => s.sortOrder)) + 1
          : 0;

      return ctx.db.quoteSection.create({
        data: {
          quoteId: input.quoteId,
          categoryId: input.categoryId,
          sortOrder: nextSort,
        },
        include: { category: true, items: true },
      });
    }),

  removeSection: protectedProcedure
    .input(z.object({ sectionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.quoteSection.findFirst({
        where: { id: input.sectionId },
        include: { quote: { select: { organizationId: true, id: true } } },
      });

      if (
        !section ||
        section.quote.organizationId !== ctx.auth.organizationId
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }

      await ctx.db.quoteSection.delete({ where: { id: input.sectionId } });
      await recalculateQuoteTotals(ctx.db, section.quote.id);

      return { success: true };
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        sectionId: z.string(),
        description: z.string().min(1),
        unitType: z
          .enum(["SQ_FT", "LINEAR_FT", "CUBIC_YD", "UNIT", "HOUR", "LUMP_SUM"])
          .default("SQ_FT"),
        length: z.number().nullable().optional(),
        width: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
        quantity: z.number().default(1),
        unitPrice: z.number().default(0),
        markupPct: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const section = await ctx.db.quoteSection.findFirst({
        where: { id: input.sectionId },
        include: {
          quote: { select: { organizationId: true, id: true } },
          items: true,
        },
      });

      if (
        !section ||
        section.quote.organizationId !== ctx.auth.organizationId
      ) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Section not found",
        });
      }

      const { quantity, total } = calculateItemTotal(
        input.unitType,
        input.length ?? null,
        input.width ?? null,
        input.height ?? null,
        input.quantity,
        input.unitPrice,
        input.markupPct
      );

      const nextSort =
        section.items.length > 0
          ? Math.max(...section.items.map((i) => i.sortOrder)) + 1
          : 0;

      const item = await ctx.db.quoteItem.create({
        data: {
          sectionId: input.sectionId,
          description: input.description,
          unitType: input.unitType,
          length: input.length ?? null,
          width: input.width ?? null,
          height: input.height ?? null,
          quantity,
          unitPrice: input.unitPrice,
          markupPct: input.markupPct,
          total,
          sortOrder: nextSort,
        },
      });

      await recalculateQuoteTotals(ctx.db, section.quote.id);

      return item;
    }),

  updateItem: protectedProcedure
    .input(
      z.object({
        itemId: z.string(),
        description: z.string().min(1).optional(),
        unitType: z
          .enum(["SQ_FT", "LINEAR_FT", "CUBIC_YD", "UNIT", "HOUR", "LUMP_SUM"])
          .optional(),
        length: z.number().nullable().optional(),
        width: z.number().nullable().optional(),
        height: z.number().nullable().optional(),
        quantity: z.number().optional(),
        unitPrice: z.number().optional(),
        markupPct: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.quoteItem.findFirst({
        where: { id: input.itemId },
        include: {
          section: {
            include: {
              quote: { select: { organizationId: true, id: true } },
            },
          },
        },
      });

      if (
        !existing ||
        existing.section.quote.organizationId !== ctx.auth.organizationId
      ) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      const unitType = input.unitType ?? existing.unitType;
      const length =
        input.length !== undefined ? input.length : Number(existing.length);
      const width =
        input.width !== undefined ? input.width : Number(existing.width);
      const height =
        input.height !== undefined ? input.height : Number(existing.height);
      const manualQty = input.quantity ?? Number(existing.quantity);
      const unitPrice = input.unitPrice ?? Number(existing.unitPrice);
      const markupPct = input.markupPct ?? Number(existing.markupPct);

      const { quantity, total } = calculateItemTotal(
        unitType,
        length,
        width,
        height,
        manualQty,
        unitPrice,
        markupPct
      );

      const item = await ctx.db.quoteItem.update({
        where: { id: input.itemId },
        data: {
          ...(input.description !== undefined && {
            description: input.description,
          }),
          ...(input.unitType !== undefined && { unitType: input.unitType }),
          length: length ?? null,
          width: width ?? null,
          height: height ?? null,
          quantity,
          unitPrice,
          markupPct,
          total,
        },
      });

      await recalculateQuoteTotals(ctx.db, existing.section.quote.id);

      return item;
    }),

  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.quoteItem.findFirst({
        where: { id: input.itemId },
        include: {
          section: {
            include: {
              quote: { select: { organizationId: true, id: true } },
            },
          },
        },
      });

      if (
        !item ||
        item.section.quote.organizationId !== ctx.auth.organizationId
      ) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      await ctx.db.quoteItem.delete({ where: { id: input.itemId } });
      await recalculateQuoteTotals(ctx.db, item.section.quote.id);

      return { success: true };
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum([
          "DRAFT",
          "SENT",
          "VIEWED",
          "ACCEPTED",
          "REJECTED",
          "EXPIRED",
        ]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const quote = await ctx.db.quote.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
      });

      if (!quote) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      const data: Prisma.QuoteUpdateInput = { status: input.status };

      if (input.status === "SENT") {
        data.sentAt = new Date();
      }
      if (input.status === "ACCEPTED" || input.status === "REJECTED") {
        data.respondedAt = new Date();
      }

      const updated = await ctx.db.quote.update({
        where: { id: input.id },
        data,
      });

      // Activity records for key status transitions (DRAFT and VIEWED have no activity type in schema)
      const activityStatuses = [
        "SENT",
        "ACCEPTED",
        "REJECTED",
        "EXPIRED",
      ] as const;
      if ((activityStatuses as readonly string[]).includes(input.status)) {
        await ctx.db.quoteActivity.create({
          data: {
            quoteId: input.id,
            type: input.status as (typeof activityStatuses)[number],
          },
        });
      }

      // Helper: resolve the internal user record for this clerk session
      const getUser = () =>
        ctx.db.user.findFirst({
          where: {
            clerkId: ctx.auth.userId,
            organizationId: ctx.auth.organizationId,
          },
        });

      // Helper: create a new Job linked to this quote
      const createLinkedJob = async (
        status: "ON_HOLD" | "IN_PROGRESS" | "SCHEDULED"
      ) => {
        const user = await getUser();
        if (!user) return;

        const jobCounter = await ctx.db.jobCounter.upsert({
          where: { organizationId: ctx.auth.organizationId },
          update: { lastNumber: { increment: 1 } },
          create: { organizationId: ctx.auth.organizationId, lastNumber: 1 },
        });
        const jobNumber = `JB-${String(jobCounter.lastNumber).padStart(3, "0")}`;

        await ctx.db.job.create({
          data: {
            organizationId: ctx.auth.organizationId,
            clientId: quote.clientId,
            quoteId: quote.id,
            createdById: user.id,
            jobNumber,
            title: quote.title,
            value: quote.total,
            status,
            startedAt: status === "IN_PROGRESS" ? new Date() : undefined,
          },
        });
      };

      // SENT → auto-create Job "En Espera" (ON_HOLD) waiting for client response
      if (input.status === "SENT") {
        const existingJob = await ctx.db.job.findUnique({
          where: { quoteId: input.id },
        });
        if (!existingJob) {
          await createLinkedJob("ON_HOLD");
        }
      }

      // ACCEPTED → move existing Job to IN_PROGRESS, or create one if missing
      if (input.status === "ACCEPTED") {
        const existingJob = await ctx.db.job.findUnique({
          where: { quoteId: input.id },
        });

        if (existingJob) {
          await ctx.db.job.update({
            where: { id: existingJob.id },
            data: {
              status: "IN_PROGRESS",
              startedAt: existingJob.startedAt ?? new Date(),
            },
          });
        } else {
          await createLinkedJob("IN_PROGRESS");
        }
      }

      // REJECTED → cancel the job if it's still on hold
      if (input.status === "REJECTED") {
        const existingJob = await ctx.db.job.findUnique({
          where: { quoteId: input.id },
        });
        if (existingJob && existingJob.status === "ON_HOLD") {
          await ctx.db.job.update({
            where: { id: existingJob.id },
            data: { status: "CANCELLED" },
          });
        }
      }

      return updated;
    }),

  duplicate: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const original = await ctx.db.quote.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
        include: {
          sections: {
            include: { items: true },
          },
        },
      });

      if (!original) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Quote not found" });
      }

      // Get new quote number
      const counter = await ctx.db.quoteCounter.upsert({
        where: { organizationId: ctx.auth.organizationId },
        update: { lastNumber: { increment: 1 } },
        create: { organizationId: ctx.auth.organizationId, lastNumber: 1 },
      });

      const quoteNumber = `QT-${String(counter.lastNumber).padStart(3, "0")}`;

      const newQuote = await ctx.db.quote.create({
        data: {
          organizationId: original.organizationId,
          clientId: original.clientId,
          createdById: original.createdById,
          quoteNumber,
          title: original.title ? `${original.title} (Copy)` : null,
          taxRate: original.taxRate,
          subtotal: original.subtotal,
          taxAmount: original.taxAmount,
          total: original.total,
          notes: original.notes,
          validUntil: original.validUntil,
          sections: {
            create: original.sections.map((section) => ({
              categoryId: section.categoryId,
              sortOrder: section.sortOrder,
              subtotal: section.subtotal,
              items: {
                create: section.items.map((item) => ({
                  description: item.description,
                  unitType: item.unitType,
                  length: item.length,
                  width: item.width,
                  height: item.height,
                  quantity: item.quantity,
                  unitPrice: item.unitPrice,
                  markupPct: item.markupPct,
                  total: item.total,
                  sortOrder: item.sortOrder,
                })),
              },
            })),
          },
        },
      });

      return newQuote;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const quote = await ctx.db.quote.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
        include: { job: true },
      });

      if (!quote) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cotización no encontrada",
        });
      }

      // Block deletion if there's an active (non-cancelled) job linked
      if (quote.job && quote.job.status !== "CANCELLED") {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `No puedes eliminar una cotización con un trabajo activo vinculado (${quote.job.jobNumber}). Cancela el trabajo primero.`,
        });
      }

      await ctx.db.quote.delete({ where: { id: input.id } });
      return { success: true };
    }),
});
