import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const RECEIPT_SYSTEM_PROMPT = `Eres un asistente especializado en extracción de datos de recibos de construcción en Puerto Rico.
Analiza la imagen del recibo y devuelve SOLO un objeto JSON válido con este formato exacto (sin texto adicional):
{
  "store_name": "nombre de la tienda",
  "store_address": "dirección o vacío si no aparece",
  "date": "YYYY-MM-DD",
  "receipt_number": "número de recibo o vacío",
  "payment_method": "método de pago o vacío",
  "items": [
    {
      "name": "nombre del artículo",
      "category": "MATERIAL",
      "quantity": 1,
      "unit_price": 0.00,
      "item_total": 0.00
    }
  ],
  "subtotal": 0.00,
  "tax": 0.00,
  "total": 0.00,
  "expense_type": "MATERIAL",
  "validation_ok": true
}

Reglas de clasificación para expense_type:
- MATERIAL: ferretería, materiales de construcción, cemento, madera, pintura, tuberías, cables, tornillos, etc.
- EQUIPMENT: gasolina, renta de equipo, herramientas, maquinaria
- LABOR: mano de obra, subcontratistas
- SUBCONTRACTOR: servicios de terceros
- PERMITS: permisos, licencias
- OTHER: todo lo demás

Usa el expense_type que corresponda a la mayoría de los items del recibo.
Si el subtotal + tax no coincide con el total, establece validation_ok = false.
La fecha debe estar en formato YYYY-MM-DD. Si no aparece, usa la fecha de hoy.
Los montos deben ser números decimales, no strings.`;

interface ReceiptData {
  store_name?: string;
  store_address?: string;
  date?: string;
  receipt_number?: string;
  payment_method?: string;
  items?: unknown[];
  subtotal?: number;
  tax?: number;
  total?: number;
  expense_type?: string;
  validation_ok?: boolean;
}

async function extractWithGemini(
  base64: string,
  mimeType: string
): Promise<ReceiptData> {
  const { GoogleGenAI } = await import("@google/genai");
  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY ?? "" });

  const response = await genai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { text: RECEIPT_SYSTEM_PROMPT },
          { inlineData: { mimeType, data: base64 } },
        ],
      },
    ],
    config: {
      temperature: 0.1,
      maxOutputTokens: 2048,
      responseMimeType: "application/json",
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  // Strip markdown code blocks if present
  const clean = text
    .replace(/^```(?:json)?\n?/m, "")
    .replace(/\n?```$/m, "")
    .trim();
  return JSON.parse(clean) as ReceiptData;
}

async function extractWithOpenAI(
  base64: string,
  mimeType: string
): Promise<ReceiptData> {
  const { default: OpenAI } = await import("openai");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64}`,
              detail: "high",
            },
          },
          { type: "text", text: RECEIPT_SYSTEM_PROMPT },
        ],
      },
    ],
  });

  const raw = response.choices[0]?.message?.content ?? "{}";
  return JSON.parse(raw) as ReceiptData;
}

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await auth();
    if (!orgId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = imageFile.type || "image/jpeg";

    // Try Gemini first; fall back to GPT-4o
    let receiptData: ReceiptData;
    try {
      receiptData = await extractWithGemini(base64, mimeType);
    } catch (geminiErr) {
      console.warn(
        "[receipt] Gemini failed, falling back to GPT-4o:",
        geminiErr
      );
      receiptData = await extractWithOpenAI(base64, mimeType);
    }

    const storeName = receiptData.store_name ?? "Tienda";
    const receiptNumber = receiptData.receipt_number ?? "";
    const total = receiptData.total ?? 0;
    const date = receiptData.date ?? new Date().toISOString().split("T")[0];
    const expenseType = receiptData.expense_type ?? "OTHER";

    const description = receiptNumber
      ? `${storeName} - Recibo #${receiptNumber}`
      : storeName;

    return NextResponse.json({
      receipt_data: receiptData,
      suggested_expense: {
        description,
        amount: total,
        date,
        category: expenseType,
        vendor: storeName,
      },
    });
  } catch (error) {
    console.error("[receipt] Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process receipt",
      },
      { status: 500 }
    );
  }
}
