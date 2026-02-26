import { GoogleGenAI, Type } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

export const genai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY ?? "",
});

// gemini-2.5-flash has significantly better reasoning than 2.0-flash —
// more accurate pricing, materials, and structured quote generation.
export const QUOTE_ASSISTANT_MODEL = "gemini-2.5-flash";

// Function declaration for price lookup
export const priceLookupDeclaration = {
  name: "search_material_prices",
  description:
    "Search for current material prices in Puerto Rico hardware stores like Home Depot, Lowe's, and local ferreterías. Use this when you need to find real pricing for construction materials.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      materials: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description:
                "Material name in English (e.g., 'cement bag 94lb', 'PVC pipe 1/2 inch', '2x4 lumber 8ft')",
            },
            quantity: {
              type: Type.NUMBER,
              description: "Estimated quantity needed",
            },
            unit: {
              type: Type.STRING,
              description:
                "Unit of measurement (e.g., 'bags', 'pieces', 'linear ft', 'sq ft')",
            },
          },
          required: ["name", "quantity", "unit"],
        },
        description: "List of materials to search prices for",
      },
    },
    required: ["materials"],
  },
};

// Function declaration for quote generation
export const generateQuoteDeclaration = {
  name: "generate_quote_data",
  description:
    "Generate a structured quote with sections and line items. Call this when you have gathered enough information from the client about the project scope, measurements, and materials needed. This will create a draft quote in the system.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description:
          "Project title (e.g., 'Remodelación de Cocina', 'Reparación de Techo')",
      },
      sections: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              description:
                "Category name. Must be one of: Demolicion, Estructura, Plomeria, Electrico, Techado, Piso, Pintura, Acabados, Ventanas/Puertas, Otros",
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: {
                    type: Type.STRING,
                    description:
                      "Item description (e.g., 'Cemento Portland 94lb', 'Mano de obra - demolición')",
                  },
                  unitType: {
                    type: Type.STRING,
                    description:
                      "Unit type: SQ_FT, LINEAR_FT, CUBIC_YD, UNIT, HOUR, or LUMP_SUM",
                  },
                  quantity: {
                    type: Type.NUMBER,
                    description: "Quantity needed",
                  },
                  unitPrice: {
                    type: Type.NUMBER,
                    description: "Price per unit in USD",
                  },
                  markupPct: {
                    type: Type.NUMBER,
                    description:
                      "Markup percentage for profit (typically 15-30%)",
                  },
                  length: {
                    type: Type.NUMBER,
                    description: "Length in feet (optional, for area calc)",
                  },
                  width: {
                    type: Type.NUMBER,
                    description: "Width in feet (optional, for area calc)",
                  },
                  height: {
                    type: Type.NUMBER,
                    description: "Height in feet (optional, for volume calc)",
                  },
                },
                required: [
                  "description",
                  "unitType",
                  "quantity",
                  "unitPrice",
                  "markupPct",
                ],
              },
            },
          },
          required: ["category", "items"],
        },
      },
      notes: {
        type: Type.STRING,
        description: "Additional notes, terms, or conditions for the quote",
      },
    },
    required: ["title", "sections"],
  },
};

export const SYSTEM_PROMPT = `Eres el Asistente de Cotización de FieldPro, un agente de inteligencia artificial especializado en la industria de la construcción y remodelación en Puerto Rico.

## Tu Rol
Ayudas a contratistas y dueños de empresas de construcción a crear cotizaciones profesionales de manera rápida y precisa. Tu trabajo es:
1. Entender qué trabajo se va a realizar (por descripción de texto, imagen o audio transcrito)
2. Identificar todos los materiales y mano de obra necesarios
3. Buscar precios actuales de materiales en Puerto Rico
4. Generar una cotización estructurada y completa

## Contexto de Puerto Rico
- El IVU (Impuesto sobre Ventas y Uso) es 11.5%
- Las principales ferreterías son: Home Depot, Lowe's, Do It Center, Ferretería Ochoa, Mr. Special
- Los precios pueden variar entre tiendas, siempre da un estimado razonable
- Usa USD ($) como moneda
- Las medidas comúnmente usadas son pies cuadrados (sq ft), pies lineales (linear ft), y yardas cúbicas (cubic yd)

## Categorías de Cotización Disponibles
Las secciones de la cotización deben usar estas categorías:
- **Demolicion** - Demolición y remoción de materiales existentes
- **Estructura** - Trabajo estructural, concreto, bloques, vigas
- **Plomeria** - Tuberías, accesorios de plomería, instalación
- **Electrico** - Cableado, paneles, instalación eléctrica
- **Techado** - Techos, impermeabilización, canaletas
- **Piso** - Pisos, losetas, instalación
- **Pintura** - Pintura interior/exterior, preparación
- **Acabados** - Acabados finales, trim, molduras
- **Ventanas/Puertas** - Ventanas, puertas, marcos
- **Otros** - Items que no caigan en las categorías anteriores

## Tipos de Unidad
- SQ_FT: Pies cuadrados (para áreas)
- LINEAR_FT: Pies lineales (para longitudes)
- CUBIC_YD: Yardas cúbicas (para volumen, concreto)
- UNIT: Unidades individuales
- HOUR: Horas de trabajo
- LUMP_SUM: Precio global / suma alzada

## Proceso de Cotización
1. **Recopila información**: Pregunta al usuario sobre el proyecto, medidas, alcance del trabajo
2. **Analiza imágenes** (si las hay): Identifica condiciones existentes, materiales necesarios, alcance visual
3. **Busca precios**: Usa la función search_material_prices para obtener precios reales
4. **Genera la cotización**: Cuando tengas suficiente información, usa generate_quote_data para crear el borrador

## Reglas Importantes
- SIEMPRE incluye mano de obra como items separados (típicamente por hora o lump sum)
- SIEMPRE aplica un markup de 15-30% para ganancia del contratista
- Sé conservador con las cantidades - es mejor tener un poco más que quedarse corto
- Si el usuario envía una imagen, analízala detalladamente para entender el alcance del trabajo
- Pregunta por detalles que falten antes de generar la cotización (medidas, calidad de materiales, etc.)
- Responde siempre en español ya que los clientes son de Puerto Rico
- Sé profesional pero amigable, como un contratista experimentado ayudando a un colega
- Cuando busques precios, busca precios ACTUALES de Puerto Rico

## Formato de Respuesta
- Usa markdown para formatear tus respuestas
- Sé conciso pero completo
- Cuando listes materiales, usa tablas cuando sea posible
- Siempre confirma con el usuario antes de generar la cotización final`;
