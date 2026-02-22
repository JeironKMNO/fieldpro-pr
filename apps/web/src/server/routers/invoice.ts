import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Prisma, type PrismaClient } from "@fieldpro/db";
import { router, protectedProcedure } from "../trpc";

async function recalculateInvoiceTotals(db: PrismaClient, invoiceId: string) {
  const items = await db.invoiceItem.findMany({ where: { invoiceId } });

  const subtotal = items.reduce(
    (sum: number, item: { total: Prisma.Decimal }) => sum + Number(item.total),
    0
  );

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { taxRate: true },
  });

  const taxRate = Number(invoice?.taxRate ?? 0);
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  await db.invoice.update({
    where: { id: invoiceId },
    data: {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount,
      total,
    },
  });
}

export const invoiceRouter = router({
  list: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
        status: z
          .enum(["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "CANCELLED"])
          .optional(),
        clientId: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, limit, search, status, clientId } = input;
      const skip = (page - 1) * limit;

      const where: Prisma.InvoiceWhereInput = {
        organizationId: ctx.auth.organizationId,
        ...(status && { status }),
        ...(clientId && { clientId }),
        ...(search && {
          OR: [
            { invoiceNumber: { contains: search, mode: "insensitive" as const } },
            {
              client: {
                name: { contains: search, mode: "insensitive" as const },
              },
            },
          ],
        }),
      };

      const [invoices, total] = await Promise.all([
        ctx.db.invoice.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            client: { select: { name: true } },
            job: { select: { jobNumber: true } },
          },
        }),
        ctx.db.invoice.count({ where }),
      ]);

      return {
        invoices: invoices.map((inv) => ({
          ...inv,
          subtotal: Number(inv.subtotal),
          taxAmount: Number(inv.taxAmount),
          total: Number(inv.total),
        })),
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
      const invoice = await ctx.db.invoice.findFirst({
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
          job: {
            select: {
              id: true,
              jobNumber: true,
              status: true,
              quote: {
                select: { id: true, quoteNumber: true },
              },
            },
          },
          items: { orderBy: { sortOrder: "asc" } },
          activities: { orderBy: { createdAt: "asc" } },
          createdBy: {
            select: { firstName: true, lastName: true },
          },
          organization: {
            select: { name: true, logoUrl: true, phone: true, license: true },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      return invoice;
    }),

  createFromJob: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify job exists and belongs to org
      const job = await ctx.db.job.findFirst({
        where: {
          id: input.jobId,
          organizationId: ctx.auth.organizationId,
        },
        include: {
          invoice: { select: { id: true } },
          quote: {
            include: {
              sections: {
                include: { items: { orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      });

      if (!job) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Job not found" });
      }

      if (job.invoice) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This job already has an invoice",
        });
      }

      // Get user DB id
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

      // Atomic invoice number
      const counter = await ctx.db.invoiceCounter.upsert({
        where: { organizationId: ctx.auth.organizationId },
        update: { lastNumber: { increment: 1 } },
        create: { organizationId: ctx.auth.organizationId, lastNumber: 1 },
      });

      const invoiceNumber = `INV-${String(counter.lastNumber).padStart(3, "0")}`;

      // Build line items from quote sections
      const lineItems: {
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
        sortOrder: number;
      }[] = [];

      let sortOrder = 0;
      if (job.quote) {
        for (const section of job.quote.sections) {
          for (const item of section.items) {
            const qty = Number(item.quantity);
            const price = Number(item.unitPrice);
            const itemTotal = Number(item.total);
            lineItems.push({
              description: item.description,
              quantity: qty,
              unitPrice: price,
              total: itemTotal,
              sortOrder: sortOrder++,
            });
          }
        }
      }

      // Calculate totals
      const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
      const taxRate = 0.115;
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;

      // Due date: 30 days from now
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await ctx.db.invoice.create({
        data: {
          organizationId: ctx.auth.organizationId,
          clientId: job.clientId,
          jobId: job.id,
          createdById: user.id,
          invoiceNumber,
          subtotal: Math.round(subtotal * 100) / 100,
          taxRate,
          taxAmount,
          total,
          dueDate,
          items: {
            create: lineItems,
          },
          activities: {
            create: { type: "CREATED" },
          },
        },
      });

      return invoice;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        notes: z.string().nullable().optional(),
        dueDate: z.date().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const invoice = await ctx.db.invoice.findFirst({
        where: { id, organizationId: ctx.auth.organizationId },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft invoices can be edited",
        });
      }

      return ctx.db.invoice.update({ where: { id }, data });
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        invoiceId: z.string(),
        description: z.string(),
        quantity: z.number().min(0),
        unitPrice: z.number().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: {
          id: input.invoiceId,
          organizationId: ctx.auth.organizationId,
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft invoices can be edited",
        });
      }

      const total = Math.round(input.quantity * input.unitPrice * 100) / 100;

      const lastItem = await ctx.db.invoiceItem.findFirst({
        where: { invoiceId: input.invoiceId },
        orderBy: { sortOrder: "desc" },
      });

      await ctx.db.invoiceItem.create({
        data: {
          invoiceId: input.invoiceId,
          description: input.description,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          total,
          sortOrder: (lastItem?.sortOrder ?? -1) + 1,
        },
      });

      await recalculateInvoiceTotals(ctx.db, input.invoiceId);
    }),

  updateItem: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        description: z.string().optional(),
        quantity: z.number().min(0).optional(),
        unitPrice: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.invoiceItem.findUnique({
        where: { id: input.id },
        include: {
          invoice: {
            select: { organizationId: true, status: true },
          },
        },
      });

      if (!item || item.invoice.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      if (item.invoice.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft invoices can be edited",
        });
      }

      const qty = input.quantity ?? Number(item.quantity);
      const price = input.unitPrice ?? Number(item.unitPrice);
      const total = Math.round(qty * price * 100) / 100;

      await ctx.db.invoiceItem.update({
        where: { id: input.id },
        data: {
          description: input.description,
          quantity: qty,
          unitPrice: price,
          total,
        },
      });

      await recalculateInvoiceTotals(ctx.db, item.invoiceId);
    }),

  removeItem: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.invoiceItem.findUnique({
        where: { id: input.id },
        include: {
          invoice: {
            select: { organizationId: true, status: true },
          },
        },
      });

      if (!item || item.invoice.organizationId !== ctx.auth.organizationId) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      if (item.invoice.status !== "DRAFT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Only draft invoices can be edited",
        });
      }

      await ctx.db.invoiceItem.delete({ where: { id: input.id } });
      await recalculateInvoiceTotals(ctx.db, item.invoiceId);
    }),

  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["SENT", "CANCELLED"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      const data: Prisma.InvoiceUpdateInput = { status: input.status };

      if (input.status === "SENT") {
        data.sentAt = new Date();
      }

      await ctx.db.invoice.update({ where: { id: input.id }, data });

      await ctx.db.invoiceActivity.create({
        data: {
          invoiceId: input.id,
          type: input.status as "SENT" | "CANCELLED",
        },
      });

      return { success: true };
    }),

  markPaid: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
        include: {
          client: { select: { name: true, email: true } },
          organization: { select: { name: true } },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (invoice.status === "PAID") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invoice is already paid",
        });
      }

      await ctx.db.invoice.update({
        where: { id: input.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
        },
      });

      await ctx.db.invoiceActivity.create({
        data: {
          invoiceId: input.id,
          type: "PAID",
        },
      });

      // Send payment confirmation email
      if (invoice.client.email) {
        const { sendPaymentConfirmation } = await import("../services/email");
        const total = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(Number(invoice.total));

        await sendPaymentConfirmation(
          invoice.client.email,
          invoice.client.name,
          invoice.invoiceNumber,
          invoice.organization.name,
          total
        ).catch(() => { });
      }

      return { success: true };
    }),

  sendToClient: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
        include: {
          client: { select: { name: true, email: true } },
          organization: { select: { name: true } },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      if (!invoice.client.email) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Client does not have an email address",
        });
      }

      const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      const shareUrl = `${APP_URL}/invoices/share/${invoice.shareToken}`;

      const total = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(invoice.total));

      const dueDate = invoice.dueDate
        ? new Date(invoice.dueDate).toLocaleDateString("es-PR", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        : "No definida";

      // Send email
      const { sendInvoiceToClient } = await import("../services/email");
      await sendInvoiceToClient(
        invoice.client.email,
        invoice.client.name,
        invoice.invoiceNumber,
        invoice.organization.name,
        total,
        dueDate,
        shareUrl,
        input.message
      );

      // Update status
      await ctx.db.invoice.update({
        where: { id: input.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });

      await ctx.db.invoiceActivity.create({
        data: {
          invoiceId: input.id,
          type: "SENT",
        },
      });

      return { success: true };
    }),

  byShareToken: protectedProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findFirst({
        where: { shareToken: input.token },
        include: {
          client: {
            include: {
              addresses: { where: { isPrimary: true }, take: 1 },
            },
          },
          items: { orderBy: { sortOrder: "asc" } },
          organization: {
            select: { name: true, logoUrl: true, phone: true, license: true },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Invoice not found" });
      }

      // Track view
      if (invoice.status === "SENT" && !invoice.viewedAt) {
        await ctx.db.invoice.update({
          where: { id: invoice.id },
          data: { status: "VIEWED", viewedAt: new Date() },
        });

        await ctx.db.invoiceActivity.create({
          data: { invoiceId: invoice.id, type: "VIEWED" },
        });
      }

      return invoice;
    }),
});

