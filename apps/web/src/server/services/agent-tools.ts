import type { PrismaClient } from "@fieldpro/db";
import { searchMaterialPrices } from "./price-search";
import {
  calculateItemTotal,
  recalculateQuoteTotals,
} from "@/server/routers/quote";

// ═══════════════════════════════════════════════════════════════
// Preview Payload Types
// ═══════════════════════════════════════════════════════════════

export type PreviewPayload =
  | { type: "quote"; data: PreviewQuote }
  | { type: "client"; id: string }
  | { type: "job"; id: string }
  | { type: "invoice"; id: string }
  | { type: "client-list"; data: ClientSummary[] }
  | { type: "dashboard"; data: DashboardStats };

export interface PreviewQuote {
  quoteNumber: string;
  title: string | null;
  createdAt: string;
  validUntil: string | null;
  notes: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  organization: {
    name: string;
    logoUrl?: string | null;
    phone?: string | null;
    license?: string | null;
  };
  client: {
    name: string;
    email: string | null;
    phone: string | null;
    addresses: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    }[];
  };
  sections: {
    id: string;
    subtotal: number;
    category: { name: string };
    items: {
      id: string;
      description: string;
      unitType: string;
      quantity: number;
      unitPrice: number;
      total: number;
      length: number | null;
      width: number | null;
    }[];
  }[];
}

export interface ClientSummary {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  type: string;
  status: string;
}

export interface DashboardStats {
  activeClients: number;
  openQuotes: number;
  activeJobs: number;
  pendingInvoices: number;
  totalPaid: number;
}

// ═══════════════════════════════════════════════════════════════
// Tool Executor Context
// ═══════════════════════════════════════════════════════════════

export interface AgentToolContext {
  organizationId: string;
  clerkUserId: string;
  db: PrismaClient;
  org: {
    name: string;
    logoUrl: string | null;
    phone: string | null;
    license: string | null;
  };
}

export interface ToolResult {
  result: unknown;
  statusMessage: string;
  preview?: PreviewPayload;
}

// ═══════════════════════════════════════════════════════════════
// Tool Declarations — Gemini Format
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const agentToolDeclarations: any[] = [
  {
    name: "get_dashboard_summary",
    description:
      "Obtiene un resumen del negocio: clientes activos, cotizaciones abiertas, trabajos en progreso, facturas pendientes y total cobrado.",
    parameters: { type: "object", properties: {}, required: [] },
  },
  {
    name: "search_clients",
    description:
      "Busca clientes en la base de datos por nombre, email o teléfono.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Texto a buscar (nombre, email, teléfono)",
        },
      },
      required: [],
    },
  },
  {
    name: "create_client",
    description: "Crea un nuevo cliente y lo guarda en la base de datos.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nombre completo del cliente" },
        email: { type: "string", description: "Email del cliente" },
        phone: { type: "string", description: "Teléfono del cliente" },
        type: {
          type: "string",
          enum: ["RESIDENTIAL", "COMMERCIAL"],
          description: "Tipo de cliente",
        },
        street: { type: "string", description: "Dirección" },
        city: { type: "string", description: "Ciudad" },
        zipCode: { type: "string", description: "Código postal" },
      },
      required: ["name", "type"],
    },
  },
  {
    name: "update_client",
    description: "Actualiza información de un cliente existente.",
    parameters: {
      type: "object",
      properties: {
        clientId: {
          type: "string",
          description: "ID del cliente a actualizar",
        },
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
        status: { type: "string", enum: ["ACTIVE", "INACTIVE", "ARCHIVED"] },
      },
      required: ["clientId"],
    },
  },
  {
    name: "get_client_details",
    description: "Obtiene los detalles completos de un cliente específico.",
    parameters: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "ID del cliente" },
      },
      required: ["clientId"],
    },
  },
  {
    name: "search_material_prices",
    description:
      "Busca precios de materiales de construcción en Home Depot Puerto Rico.",
    parameters: {
      type: "object",
      properties: {
        materials: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              quantity: { type: "number" },
              unit: { type: "string" },
            },
            required: ["name", "quantity", "unit"],
          },
        },
      },
      required: ["materials"],
    },
  },
  {
    name: "create_quote",
    description:
      "Crea una cotización completa con secciones e ítems y la guarda en la base de datos.",
    parameters: {
      type: "object",
      properties: {
        clientId: { type: "string", description: "ID del cliente" },
        title: {
          type: "string",
          description: "Título descriptivo de la cotización",
        },
        notes: {
          type: "string",
          description: "Condiciones generales, términos de pago, alcance",
        },
        sections: {
          type: "array",
          description: "Secciones de trabajo",
          items: {
            type: "object",
            properties: {
              categoryName: {
                type: "string",
                description:
                  "Nombre de categoría: Demolicion, Estructura, Plomeria, Electrico, Techado, Piso, Pintura, Acabados, Ventanas/Puertas, Otros",
              },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    description: { type: "string" },
                    unitType: {
                      type: "string",
                      enum: [
                        "SQ_FT",
                        "LINEAR_FT",
                        "CUBIC_YD",
                        "UNIT",
                        "HOUR",
                        "LUMP_SUM",
                      ],
                    },
                    quantity: { type: "number" },
                    unitPrice: { type: "number" },
                    markupPct: { type: "number" },
                  },
                  required: [
                    "description",
                    "unitType",
                    "quantity",
                    "unitPrice",
                  ],
                },
              },
            },
            required: ["categoryName", "items"],
          },
        },
      },
      required: ["clientId", "sections"],
    },
  },
  {
    name: "add_quote_section",
    description:
      "Agrega una nueva sección con ítems a una cotización existente.",
    parameters: {
      type: "object",
      properties: {
        quoteId: { type: "string" },
        categoryName: {
          type: "string",
          description:
            "Demolicion, Estructura, Plomeria, Electrico, Techado, Piso, Pintura, Acabados, Ventanas/Puertas, Otros",
        },
        items: {
          type: "array",
          items: {
            type: "object",
            properties: {
              description: { type: "string" },
              unitType: {
                type: "string",
                enum: [
                  "SQ_FT",
                  "LINEAR_FT",
                  "CUBIC_YD",
                  "UNIT",
                  "HOUR",
                  "LUMP_SUM",
                ],
              },
              quantity: { type: "number" },
              unitPrice: { type: "number" },
              markupPct: { type: "number" },
            },
            required: ["description", "unitType", "quantity", "unitPrice"],
          },
        },
      },
      required: ["quoteId", "categoryName", "items"],
    },
  },
  {
    name: "send_quote",
    description:
      "Cambia el estado de una cotización a SENT (enviada al cliente).",
    parameters: {
      type: "object",
      properties: {
        quoteId: { type: "string", description: "ID de la cotización" },
      },
      required: ["quoteId"],
    },
  },
  {
    name: "get_quote_details",
    description:
      "Obtiene los detalles de una cotización para mostrarla en el panel de vista previa.",
    parameters: {
      type: "object",
      properties: {
        quoteId: { type: "string" },
      },
      required: ["quoteId"],
    },
  },
  {
    name: "create_job",
    description:
      "Crea un trabajo/proyecto para un cliente, opcionalmente vinculado a una cotización aceptada.",
    parameters: {
      type: "object",
      properties: {
        clientId: { type: "string" },
        quoteId: {
          type: "string",
          description: "ID de cotización aceptada (opcional)",
        },
        title: { type: "string", description: "Título del trabajo" },
        scheduledDate: {
          type: "string",
          description: "Fecha programada en formato ISO",
        },
      },
      required: ["clientId"],
    },
  },
  {
    name: "update_job_status",
    description: "Actualiza el estado de un trabajo.",
    parameters: {
      type: "object",
      properties: {
        jobId: { type: "string" },
        status: {
          type: "string",
          enum: [
            "SCHEDULED",
            "IN_PROGRESS",
            "ON_HOLD",
            "COMPLETED",
            "CANCELLED",
          ],
        },
      },
      required: ["jobId", "status"],
    },
  },
  {
    name: "add_job_task",
    description: "Agrega una tarea a un trabajo.",
    parameters: {
      type: "object",
      properties: {
        jobId: { type: "string" },
        title: { type: "string" },
        dueDate: {
          type: "string",
          description: "Fecha límite en formato ISO (opcional)",
        },
      },
      required: ["jobId", "title"],
    },
  },
  {
    name: "add_expense",
    description: "Registra un gasto en un trabajo.",
    parameters: {
      type: "object",
      properties: {
        jobId: { type: "string" },
        description: { type: "string" },
        amount: { type: "number" },
        category: {
          type: "string",
          enum: [
            "EQUIPMENT",
            "SUBCONTRACTOR",
            "PERMITS",
            "MATERIAL",
            "LABOR",
            "OTHER",
          ],
        },
        vendor: { type: "string" },
      },
      required: ["jobId", "description", "amount", "category"],
    },
  },
  {
    name: "create_invoice",
    description: "Crea una factura para un trabajo completado.",
    parameters: {
      type: "object",
      properties: {
        jobId: { type: "string" },
      },
      required: ["jobId"],
    },
  },
  {
    name: "send_invoice",
    description: "Cambia el estado de una factura a SENT (enviada al cliente).",
    parameters: {
      type: "object",
      properties: {
        invoiceId: { type: "string" },
      },
      required: ["invoiceId"],
    },
  },
  {
    name: "mark_invoice_paid",
    description: "Marca una factura como pagada.",
    parameters: {
      type: "object",
      properties: {
        invoiceId: { type: "string" },
      },
      required: ["invoiceId"],
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// Tool Declarations — OpenAI Format
// ═══════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const agentOpenAITools: any[] = agentToolDeclarations.map((decl) => ({
  type: "function",
  function: {
    name: decl.name,
    description: decl.description,
    parameters: decl.parameters,
  },
}));

// ═══════════════════════════════════════════════════════════════
// Helper: Build PreviewQuote from DB quote
// ═══════════════════════════════════════════════════════════════

async function buildPreviewQuote(
  db: PrismaClient,
  quoteId: string,
  org: AgentToolContext["org"]
): Promise<PreviewQuote | null> {
  const quote = await db.quote.findUnique({
    where: { id: quoteId },
    include: {
      client: {
        include: { addresses: { where: { isPrimary: true }, take: 1 } },
      },
      sections: {
        include: {
          category: { select: { name: true } },
          items: true,
        },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!quote) return null;

  return {
    quoteNumber: quote.quoteNumber,
    title: quote.title,
    createdAt: quote.createdAt.toISOString(),
    validUntil: quote.validUntil?.toISOString() ?? null,
    notes: quote.notes,
    subtotal: Number(quote.subtotal),
    taxRate: Number(quote.taxRate),
    taxAmount: Number(quote.taxAmount),
    total: Number(quote.total),
    organization: org,
    client: {
      name: quote.client.name,
      email: quote.client.email,
      phone: quote.client.phone,
      addresses: quote.client.addresses.map((a) => ({
        street: a.street,
        city: a.city,
        state: a.state,
        zipCode: a.zipCode,
      })),
    },
    sections: quote.sections.map((s) => ({
      id: s.id,
      subtotal: Number(s.subtotal),
      category: { name: s.category.name },
      items: s.items.map((item) => ({
        id: item.id,
        description: item.description,
        unitType: item.unitType,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        length: item.length ? Number(item.length) : null,
        width: item.width ? Number(item.width) : null,
      })),
    })),
  };
}

// ═══════════════════════════════════════════════════════════════
// Main Tool Executor
// ═══════════════════════════════════════════════════════════════

export async function executeAgentTool(
  toolName: string,
  args: Record<string, unknown>,
  ctx: AgentToolContext
): Promise<ToolResult> {
  const { db, organizationId, clerkUserId, org } = ctx;

  // Helper: resolve internal user id
  const getUser = async () => {
    const user = await db.user.findFirst({
      where: { clerkId: clerkUserId, organizationId },
    });
    if (!user) throw new Error("User not found in database");
    return user;
  };

  switch (toolName) {
    // ── Dashboard ──────────────────────────────────────────────
    case "get_dashboard_summary": {
      const [
        activeClients,
        openQuotes,
        activeJobs,
        pendingInvoices,
        paidResult,
      ] = await Promise.all([
        db.client.count({ where: { organizationId, status: "ACTIVE" } }),
        db.quote.count({
          where: { organizationId, status: { in: ["SENT", "VIEWED"] } },
        }),
        db.job.count({
          where: {
            organizationId,
            status: { in: ["SCHEDULED", "IN_PROGRESS"] },
          },
        }),
        db.invoice.count({
          where: {
            organizationId,
            status: { in: ["SENT", "VIEWED", "OVERDUE"] },
          },
        }),
        db.invoice.aggregate({
          where: { organizationId, status: "PAID" },
          _sum: { total: true },
        }),
      ]);

      const stats: DashboardStats = {
        activeClients,
        openQuotes,
        activeJobs,
        pendingInvoices,
        totalPaid: Number(paidResult._sum.total ?? 0),
      };

      return {
        result: stats,
        statusMessage: "📊 Cargando resumen del negocio...",
        preview: { type: "dashboard", data: stats },
      };
    }

    // ── Clients ────────────────────────────────────────────────
    case "search_clients": {
      const query = (args.query as string) || "";
      const clients = await db.client.findMany({
        where: {
          organizationId,
          ...(query && {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
              { phone: { contains: query, mode: "insensitive" } },
            ],
          }),
        },
        take: 10,
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          type: true,
          status: true,
        },
      });

      const data: ClientSummary[] = clients.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        type: c.type,
        status: c.status,
      }));

      return {
        result: data,
        statusMessage: "🔍 Buscando clientes...",
        preview: { type: "client-list", data },
      };
    }

    case "create_client": {
      const clientData: Parameters<typeof db.client.create>[0]["data"] = {
        organizationId,
        name: args.name as string,
        email: (args.email as string) || null,
        phone: (args.phone as string) || null,
        type: (args.type as "RESIDENTIAL" | "COMMERCIAL") || "RESIDENTIAL",
      };
      if (args.street) {
        clientData.addresses = {
          create: {
            street: args.street as string,
            city: (args.city as string) || "San Juan",
            state: "PR",
            zipCode: (args.zipCode as string) || "00901",
            isPrimary: true,
          },
        };
      }
      const client = await db.client.create({ data: clientData });

      return {
        result: { id: client.id, name: client.name },
        statusMessage: "✅ Creando cliente...",
        preview: { type: "client", id: client.id },
      };
    }

    case "update_client": {
      const { clientId, ...fields } = args as Record<string, string>;
      await db.client.updateMany({
        where: { id: clientId, organizationId },
        data: {
          ...(fields.name && { name: fields.name }),
          ...(fields.email && { email: fields.email }),
          ...(fields.phone && { phone: fields.phone }),
          ...(fields.status && {
            status: fields.status as "ACTIVE" | "INACTIVE" | "ARCHIVED",
          }),
        },
      });

      return {
        result: { id: clientId },
        statusMessage: "✅ Actualizando cliente...",
        preview: { type: "client", id: clientId },
      };
    }

    case "get_client_details": {
      const clientId = args.clientId as string;
      const client = await db.client.findFirst({
        where: { id: clientId, organizationId },
      });

      if (!client) throw new Error("Cliente no encontrado");

      return {
        result: { id: clientId, name: client.name },
        statusMessage: "📋 Cargando datos del cliente...",
        preview: { type: "client", id: clientId },
      };
    }

    // ── Material Prices ────────────────────────────────────────
    case "search_material_prices": {
      const materials = args.materials as Array<{
        name: string;
        quantity: number;
        unit: string;
      }>;
      const prices = await searchMaterialPrices(materials);
      return {
        result: prices,
        statusMessage: "🔍 Buscando precios en Home Depot PR...",
      };
    }

    // ── Quotes ─────────────────────────────────────────────────
    case "create_quote": {
      const user = await getUser();

      // Atomic counter
      const counter = await db.quoteCounter.upsert({
        where: { organizationId },
        create: { organizationId, lastNumber: 1 },
        update: { lastNumber: { increment: 1 } },
      });
      const quoteNumber = `COT-${String(counter.lastNumber).padStart(3, "0")}`;

      const quote = await db.quote.create({
        data: {
          organizationId,
          clientId: args.clientId as string,
          createdById: user.id,
          quoteNumber,
          title: (args.title as string) || null,
          notes: (args.notes as string) || null,
        },
      });

      // Create sections and items
      const sections =
        (args.sections as Array<{
          categoryName: string;
          items: Array<{
            description: string;
            unitType: string;
            quantity: number;
            unitPrice: number;
            markupPct?: number;
          }>;
        }>) || [];

      for (let si = 0; si < sections.length; si++) {
        const sec = sections[si];

        // Upsert category
        const category = await db.quoteCategory.upsert({
          where: {
            organizationId_name: { organizationId, name: sec.categoryName },
          },
          create: { organizationId, name: sec.categoryName, sortOrder: si + 1 },
          update: {},
        });

        const section = await db.quoteSection.create({
          data: { quoteId: quote.id, categoryId: category.id, sortOrder: si },
        });

        for (let ii = 0; ii < sec.items.length; ii++) {
          const item = sec.items[ii];
          const markupPct = item.markupPct ?? 0;
          const { quantity, total } = calculateItemTotal(
            item.unitType,
            null,
            null,
            null,
            item.quantity,
            item.unitPrice,
            markupPct
          );
          await db.quoteItem.create({
            data: {
              sectionId: section.id,
              description: item.description,
              unitType: item.unitType as
                | "SQ_FT"
                | "LINEAR_FT"
                | "CUBIC_YD"
                | "UNIT"
                | "HOUR"
                | "LUMP_SUM",
              quantity,
              unitPrice: item.unitPrice,
              markupPct,
              total,
              sortOrder: ii,
            },
          });
        }
      }

      await recalculateQuoteTotals(db, quote.id);

      const preview = await buildPreviewQuote(db, quote.id, org);

      return {
        result: { id: quote.id, quoteNumber },
        statusMessage: "📝 Creando cotización...",
        ...(preview && { preview: { type: "quote" as const, data: preview } }),
      };
    }

    case "add_quote_section": {
      const quoteId = args.quoteId as string;

      const quote = await db.quote.findFirst({
        where: { id: quoteId, organizationId },
      });
      if (!quote) throw new Error("Cotización no encontrada");

      const sectionCount = await db.quoteSection.count({ where: { quoteId } });
      const categoryName = args.categoryName as string;

      const category = await db.quoteCategory.upsert({
        where: { organizationId_name: { organizationId, name: categoryName } },
        create: {
          organizationId,
          name: categoryName,
          sortOrder: sectionCount + 1,
        },
        update: {},
      });

      const section = await db.quoteSection.create({
        data: { quoteId, categoryId: category.id, sortOrder: sectionCount },
      });

      const items =
        (args.items as Array<{
          description: string;
          unitType: string;
          quantity: number;
          unitPrice: number;
          markupPct?: number;
        }>) || [];

      for (let ii = 0; ii < items.length; ii++) {
        const item = items[ii];
        const markupPct = item.markupPct ?? 0;
        const { quantity, total } = calculateItemTotal(
          item.unitType,
          null,
          null,
          null,
          item.quantity,
          item.unitPrice,
          markupPct
        );
        await db.quoteItem.create({
          data: {
            sectionId: section.id,
            description: item.description,
            unitType: item.unitType as
              | "SQ_FT"
              | "LINEAR_FT"
              | "CUBIC_YD"
              | "UNIT"
              | "HOUR"
              | "LUMP_SUM",
            quantity,
            unitPrice: item.unitPrice,
            markupPct,
            total,
            sortOrder: ii,
          },
        });
      }

      await recalculateQuoteTotals(db, quoteId);
      const preview = await buildPreviewQuote(db, quoteId, org);

      return {
        result: { sectionId: section.id },
        statusMessage: "📝 Agregando sección a cotización...",
        ...(preview && { preview: { type: "quote" as const, data: preview } }),
      };
    }

    case "send_quote": {
      const quoteId = args.quoteId as string;
      await db.quote.updateMany({
        where: { id: quoteId, organizationId },
        data: { status: "SENT", sentAt: new Date() },
      });
      await db.quoteActivity.create({
        data: { quoteId, type: "SENT" },
      });
      const preview = await buildPreviewQuote(db, quoteId, org);

      return {
        result: { quoteId },
        statusMessage: "📤 Enviando cotización...",
        ...(preview && { preview: { type: "quote" as const, data: preview } }),
      };
    }

    case "get_quote_details": {
      const quoteId = args.quoteId as string;
      const preview = await buildPreviewQuote(db, quoteId, org);
      if (!preview) throw new Error("Cotización no encontrada");

      return {
        result: { quoteNumber: preview.quoteNumber, total: preview.total },
        statusMessage: "📋 Cargando cotización...",
        preview: { type: "quote", data: preview },
      };
    }

    // ── Jobs ───────────────────────────────────────────────────
    case "create_job": {
      const user = await getUser();

      const counter = await db.jobCounter.upsert({
        where: { organizationId },
        create: { organizationId, lastNumber: 1 },
        update: { lastNumber: { increment: 1 } },
      });
      const jobNumber = `JOB-${String(counter.lastNumber).padStart(3, "0")}`;

      let value = 0;
      if (args.quoteId) {
        const quote = await db.quote.findFirst({
          where: { id: args.quoteId as string, organizationId },
          select: { total: true },
        });
        if (quote) value = Number(quote.total);
      }

      const jobData: Parameters<typeof db.job.create>[0]["data"] = {
        organizationId,
        clientId: args.clientId as string,
        createdById: user.id,
        jobNumber,
        title: (args.title as string) || null,
        value,
      };
      if (args.quoteId) jobData.quoteId = args.quoteId as string;
      if (args.scheduledDate)
        jobData.scheduledDate = new Date(args.scheduledDate as string);
      const job = await db.job.create({ data: jobData });

      return {
        result: { id: job.id, jobNumber },
        statusMessage: "🔨 Creando trabajo...",
        preview: { type: "job", id: job.id },
      };
    }

    case "update_job_status": {
      const jobId = args.jobId as string;
      const status = args.status as
        | "SCHEDULED"
        | "IN_PROGRESS"
        | "ON_HOLD"
        | "COMPLETED"
        | "CANCELLED";
      const jobUpdateData: Parameters<typeof db.job.updateMany>[0]["data"] = {
        status,
      };
      if (status === "IN_PROGRESS") jobUpdateData.startedAt = new Date();
      if (status === "COMPLETED") jobUpdateData.completedAt = new Date();
      await db.job.updateMany({
        where: { id: jobId, organizationId },
        data: jobUpdateData,
      });
      return {
        result: { jobId, status },
        statusMessage: "🔄 Actualizando estado del trabajo...",
        preview: { type: "job", id: jobId },
      };
    }

    case "add_job_task": {
      const taskData: Parameters<typeof db.jobTask.create>[0]["data"] = {
        jobId: args.jobId as string,
        title: args.title as string,
      };
      if (args.dueDate) taskData.dueDate = new Date(args.dueDate as string);
      const task = await db.jobTask.create({ data: taskData });
      return {
        result: { taskId: task.id },
        statusMessage: "✅ Agregando tarea...",
        preview: { type: "job", id: args.jobId as string },
      };
    }

    case "add_expense": {
      const expenseData: Parameters<typeof db.expense.create>[0]["data"] = {
        organizationId,
        jobId: args.jobId as string,
        description: args.description as string,
        amount: args.amount as number,
        category:
          (args.category as
            | "EQUIPMENT"
            | "SUBCONTRACTOR"
            | "PERMITS"
            | "MATERIAL"
            | "LABOR"
            | "OTHER") || "OTHER",
      };
      if (args.vendor) expenseData.vendor = args.vendor as string;
      const expense = await db.expense.create({ data: expenseData });
      return {
        result: { expenseId: expense.id },
        statusMessage: "💰 Registrando gasto...",
        preview: { type: "job", id: args.jobId as string },
      };
    }

    // ── Invoices ───────────────────────────────────────────────
    case "create_invoice": {
      const user = await getUser();
      const jobId = args.jobId as string;

      const job = await db.job.findFirst({
        where: { id: jobId, organizationId },
        include: {
          quote: {
            include: {
              sections: { include: { items: true } },
            },
          },
        },
      });
      if (!job) throw new Error("Trabajo no encontrado");

      // Check no existing invoice
      const existing = await db.invoice.findUnique({ where: { jobId } });
      if (existing) {
        return {
          result: { id: existing.id, invoiceNumber: existing.invoiceNumber },
          statusMessage: "⚠️ El trabajo ya tiene una factura.",
          preview: { type: "invoice", id: existing.id },
        };
      }

      const counter = await db.invoiceCounter.upsert({
        where: { organizationId },
        create: { organizationId, lastNumber: 1 },
        update: { lastNumber: { increment: 1 } },
      });
      const invoiceNumber = `INV-${String(counter.lastNumber).padStart(3, "0")}`;

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
            lineItems.push({
              description: item.description,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unitPrice),
              total: Number(item.total),
              sortOrder: sortOrder++,
            });
          }
        }
      } else {
        lineItems.push({
          description: job.title || "Servicios prestados",
          quantity: 1,
          unitPrice: Number(job.value),
          total: Number(job.value),
          sortOrder: 0,
        });
      }

      const subtotal = lineItems.reduce((sum, i) => sum + i.total, 0);
      const taxRate = 0.115;
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const total = Math.round((subtotal + taxAmount) * 100) / 100;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const invoice = await db.invoice.create({
        data: {
          organizationId,
          clientId: job.clientId,
          jobId: job.id,
          createdById: user.id,
          invoiceNumber,
          subtotal: Math.round(subtotal * 100) / 100,
          taxRate,
          taxAmount,
          total,
          dueDate,
          items: { create: lineItems },
          activities: { create: { type: "CREATED" } },
        },
      });

      return {
        result: { id: invoice.id, invoiceNumber },
        statusMessage: "🧾 Creando factura...",
        preview: { type: "invoice", id: invoice.id },
      };
    }

    case "send_invoice": {
      const invoiceId = args.invoiceId as string;
      await db.invoice.updateMany({
        where: { id: invoiceId, organizationId },
        data: { status: "SENT", sentAt: new Date() },
      });
      await db.invoiceActivity.create({
        data: { invoiceId, type: "SENT" },
      });
      return {
        result: { invoiceId },
        statusMessage: "📤 Enviando factura...",
        preview: { type: "invoice", id: invoiceId },
      };
    }

    case "mark_invoice_paid": {
      const invoiceId = args.invoiceId as string;
      await db.invoice.updateMany({
        where: { id: invoiceId, organizationId },
        data: { status: "PAID", paidAt: new Date() },
      });
      await db.invoiceActivity.create({
        data: { invoiceId, type: "PAID" },
      });
      return {
        result: { invoiceId },
        statusMessage: "✅ Marcando factura como pagada...",
        preview: { type: "invoice", id: invoiceId },
      };
    }

    default:
      throw new Error(`Tool desconocido: ${toolName}`);
  }
}
