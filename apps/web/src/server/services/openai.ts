import OpenAI from "openai";
import type { ChatCompletionTool } from "openai/resources/chat/completions";

if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not set. GPT-4o features will not work.");
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY ?? "",
});

export const GPT4O_MODEL = "gpt-4o";

// Tool definitions in OpenAI function calling format
export const openaiTools: ChatCompletionTool[] = [
    {
        type: "function",
        function: {
            name: "search_material_prices",
            description:
                "Search for current material prices in Puerto Rico hardware stores like Home Depot, Lowe's, and local ferreterías. Use this when you need to find real pricing for construction materials.",
            parameters: {
                type: "object",
                properties: {
                    materials: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                name: {
                                    type: "string",
                                    description:
                                        "Material name in English (e.g., 'cement bag 94lb', 'PVC pipe 1/2 inch', '2x4 lumber 8ft')",
                                },
                                quantity: {
                                    type: "number",
                                    description: "Estimated quantity needed",
                                },
                                unit: {
                                    type: "string",
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
        },
    },
    {
        type: "function",
        function: {
            name: "generate_quote_data",
            description:
                "Generate a structured quote with sections and line items. Call this when you have gathered enough information from the client about the project scope, measurements, and materials needed.",
            parameters: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description:
                            "Project title (e.g., 'Remodelación de Cocina', 'Reparación de Techo')",
                    },
                    sections: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                category: {
                                    type: "string",
                                    description:
                                        "Category name. Must be one of: Demolicion, Estructura, Plomeria, Electrico, Techado, Piso, Pintura, Acabados, Ventanas/Puertas, Otros",
                                },
                                items: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            description: {
                                                type: "string",
                                                description:
                                                    "Item description (e.g., 'Cemento Portland 94lb', 'Mano de obra - demolición')",
                                            },
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
                                                description: "Unit type for measurement",
                                            },
                                            quantity: {
                                                type: "number",
                                                description: "Quantity needed",
                                            },
                                            unitPrice: {
                                                type: "number",
                                                description: "Price per unit in USD",
                                            },
                                            markupPct: {
                                                type: "number",
                                                description:
                                                    "Markup percentage for profit (typically 15-30%)",
                                            },
                                            length: {
                                                type: "number",
                                                description:
                                                    "Length in feet (optional, for area calc)",
                                            },
                                            width: {
                                                type: "number",
                                                description:
                                                    "Width in feet (optional, for area calc)",
                                            },
                                            height: {
                                                type: "number",
                                                description:
                                                    "Height in feet (optional, for volume calc)",
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
                        type: "string",
                        description:
                            "Additional notes, terms, or conditions for the quote",
                    },
                },
                required: ["title", "sections"],
            },
        },
    },
];
