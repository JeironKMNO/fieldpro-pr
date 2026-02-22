/**
 * Quote Templates for common construction/landscaping jobs in Puerto Rico.
 * Prices reflect current PR market rates (2024-2026).
 * Users can adjust quantities and prices after creating from template.
 */

export interface TemplateItem {
  description: string;
  unitType: "SQ_FT" | "LINEAR_FT" | "CUBIC_YD" | "UNIT" | "HOUR" | "LUMP_SUM";
  quantity: number;
  unitPrice: number;
  markupPct: number;
}

export interface TemplateSection {
  category: string;
  items: TemplateItem[];
}

export interface QuoteTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  sections: TemplateSection[];
  defaultNotes: string;
}

export const QUOTE_TEMPLATES: QuoteTemplate[] = [
  {
    id: "bathroom-remodel",
    name: "Remodelación de Baño",
    icon: "🚿",
    description: "Demolición, plomería, piso, pintura y accesorios",
    sections: [
      {
        category: "Demolicion",
        items: [
          { description: "Demolición de baño existente (piso, paredes, fixtures)", unitType: "LUMP_SUM", quantity: 1, unitPrice: 1200, markupPct: 20 },
          { description: "Remoción de escombros y disposición", unitType: "LUMP_SUM", quantity: 1, unitPrice: 350, markupPct: 20 },
        ],
      },
      {
        category: "Plomeria",
        items: [
          { description: "Instalación de inodoro nuevo", unitType: "UNIT", quantity: 1, unitPrice: 450, markupPct: 20 },
          { description: "Instalación de lavamanos con grifo", unitType: "UNIT", quantity: 1, unitPrice: 380, markupPct: 20 },
          { description: "Instalación de ducha/bañera con válvulas", unitType: "UNIT", quantity: 1, unitPrice: 650, markupPct: 20 },
          { description: "Conexiones de agua fría y caliente", unitType: "LUMP_SUM", quantity: 1, unitPrice: 400, markupPct: 20 },
          { description: "Desagüe y ventilación PVC", unitType: "LUMP_SUM", quantity: 1, unitPrice: 350, markupPct: 20 },
        ],
      },
      {
        category: "Piso",
        items: [
          { description: "Instalación de piso cerámico/porcelánico", unitType: "SQ_FT", quantity: 50, unitPrice: 8, markupPct: 20 },
          { description: "Instalación de azulejo en paredes de ducha", unitType: "SQ_FT", quantity: 60, unitPrice: 10, markupPct: 20 },
        ],
      },
      {
        category: "Electrico",
        items: [
          { description: "Iluminación de baño (luminaria empotrada)", unitType: "UNIT", quantity: 2, unitPrice: 85, markupPct: 15 },
          { description: "Tomacorriente GFCI", unitType: "UNIT", quantity: 1, unitPrice: 125, markupPct: 20 },
          { description: "Extractor de humedad", unitType: "UNIT", quantity: 1, unitPrice: 200, markupPct: 15 },
        ],
      },
      {
        category: "Pintura",
        items: [
          { description: "Pintura de paredes y techo (pintura anti-humedad)", unitType: "SQ_FT", quantity: 150, unitPrice: 3, markupPct: 20 },
        ],
      },
    ],
    defaultNotes: "Cotización incluye materiales y mano de obra. No incluye permisos municipales. Fixtures y accesorios seleccionados por el cliente. Garantía de 1 año en mano de obra.",
  },
  {
    id: "kitchen-remodel",
    name: "Remodelación de Cocina",
    icon: "🍳",
    description: "Demolición, plomería, eléctrico, piso, gabinetes y pintura",
    sections: [
      {
        category: "Demolicion",
        items: [
          { description: "Demolición de cocina existente (gabinetes, countertop, piso)", unitType: "LUMP_SUM", quantity: 1, unitPrice: 1800, markupPct: 20 },
          { description: "Remoción de escombros y disposición", unitType: "LUMP_SUM", quantity: 1, unitPrice: 450, markupPct: 20 },
        ],
      },
      {
        category: "Plomeria",
        items: [
          { description: "Reubicación/instalación de fregadero", unitType: "UNIT", quantity: 1, unitPrice: 550, markupPct: 20 },
          { description: "Conexión de línea de gas (si aplica)", unitType: "LUMP_SUM", quantity: 1, unitPrice: 400, markupPct: 25 },
          { description: "Conexión de agua para lavaplatos", unitType: "UNIT", quantity: 1, unitPrice: 250, markupPct: 20 },
        ],
      },
      {
        category: "Electrico",
        items: [
          { description: "Panel dedicado para cocina (breaker 20A)", unitType: "UNIT", quantity: 1, unitPrice: 450, markupPct: 20 },
          { description: "Tomacorrientes GFCI (sobre countertop)", unitType: "UNIT", quantity: 4, unitPrice: 125, markupPct: 20 },
          { description: "Iluminación bajo gabinete LED", unitType: "LINEAR_FT", quantity: 12, unitPrice: 25, markupPct: 15 },
          { description: "Iluminación general de cocina", unitType: "UNIT", quantity: 3, unitPrice: 95, markupPct: 15 },
        ],
      },
      {
        category: "Piso",
        items: [
          { description: "Instalación de piso porcelánico antideslizante", unitType: "SQ_FT", quantity: 120, unitPrice: 8.5, markupPct: 20 },
        ],
      },
      {
        category: "Acabados",
        items: [
          { description: "Instalación de gabinetes de cocina (superiores e inferiores)", unitType: "LINEAR_FT", quantity: 18, unitPrice: 180, markupPct: 15 },
          { description: "Countertop de granito/cuarzo", unitType: "LINEAR_FT", quantity: 12, unitPrice: 85, markupPct: 15 },
          { description: "Backsplash de azulejo", unitType: "SQ_FT", quantity: 30, unitPrice: 12, markupPct: 20 },
        ],
      },
      {
        category: "Pintura",
        items: [
          { description: "Pintura de paredes y techo", unitType: "SQ_FT", quantity: 300, unitPrice: 2.75, markupPct: 20 },
        ],
      },
    ],
    defaultNotes: "Cotización incluye materiales y mano de obra. Gabinetes y countertop sujetos a selección final del cliente. No incluye electrodomésticos. Garantía de 1 año en mano de obra.",
  },
  {
    id: "exterior-paint",
    name: "Pintura Exterior",
    icon: "🏠",
    description: "Preparación de superficie, primer y pintura exterior",
    sections: [
      {
        category: "Pintura",
        items: [
          { description: "Lavado a presión de paredes exteriores", unitType: "SQ_FT", quantity: 1200, unitPrice: 0.5, markupPct: 25 },
          { description: "Raspado y preparación de superficie", unitType: "SQ_FT", quantity: 1200, unitPrice: 1, markupPct: 20 },
          { description: "Aplicación de primer sellador", unitType: "SQ_FT", quantity: 1200, unitPrice: 1.25, markupPct: 20 },
          { description: "Pintura exterior (2 manos, Sherwin-Williams Duration o similar)", unitType: "SQ_FT", quantity: 1200, unitPrice: 2.75, markupPct: 20 },
          { description: "Pintura de puertas y marcos", unitType: "UNIT", quantity: 6, unitPrice: 85, markupPct: 20 },
          { description: "Pintura de verjas/rejas (si aplica)", unitType: "LINEAR_FT", quantity: 40, unitPrice: 8, markupPct: 20 },
        ],
      },
    ],
    defaultNotes: "Cotización incluye materiales y mano de obra. Se utilizará pintura premium resistente a intemperie. Colores seleccionados por el cliente. Garantía de 2 años contra descascado.",
  },
  {
    id: "interior-paint",
    name: "Pintura Interior",
    icon: "🎨",
    description: "Pintura interior de casa completa o por habitación",
    sections: [
      {
        category: "Pintura",
        items: [
          { description: "Preparación de paredes (empaste, lijado, limpieza)", unitType: "SQ_FT", quantity: 800, unitPrice: 1, markupPct: 20 },
          { description: "Aplicación de primer/sellador", unitType: "SQ_FT", quantity: 800, unitPrice: 1, markupPct: 20 },
          { description: "Pintura de paredes interior (2 manos)", unitType: "SQ_FT", quantity: 800, unitPrice: 2.5, markupPct: 20 },
          { description: "Pintura de techos", unitType: "SQ_FT", quantity: 400, unitPrice: 2.25, markupPct: 20 },
          { description: "Pintura de puertas y marcos interiores", unitType: "UNIT", quantity: 8, unitPrice: 75, markupPct: 20 },
          { description: "Protección de pisos y muebles", unitType: "LUMP_SUM", quantity: 1, unitPrice: 200, markupPct: 15 },
        ],
      },
    ],
    defaultNotes: "Cotización incluye materiales y mano de obra. Pintura de calidad premium (Sherwin-Williams o equivalente). Colores seleccionados por el cliente. Se protegerán pisos y áreas no pintadas.",
  },
  {
    id: "terrace-carport",
    name: "Terraza / Marquesina",
    icon: "🏗️",
    description: "Estructura, losa, techo, piso y sistema eléctrico",
    sections: [
      {
        category: "Demolicion",
        items: [
          { description: "Preparación de terreno y excavación", unitType: "SQ_FT", quantity: 200, unitPrice: 3, markupPct: 20 },
        ],
      },
      {
        category: "Estructura",
        items: [
          { description: "Zapatas de cimentación 2x2x1", unitType: "UNIT", quantity: 4, unitPrice: 350, markupPct: 20 },
          { description: "Columnas de concreto reforzado 8x8", unitType: "UNIT", quantity: 4, unitPrice: 450, markupPct: 25 },
          { description: "Vigas de amarre perimetrales", unitType: "LINEAR_FT", quantity: 60, unitPrice: 18, markupPct: 20 },
          { description: "Losa de concreto 4\" con malla electrosoldada", unitType: "SQ_FT", quantity: 200, unitPrice: 12, markupPct: 20 },
        ],
      },
      {
        category: "Techado",
        items: [
          { description: "Estructura de techo (tubulares de acero)", unitType: "SQ_FT", quantity: 200, unitPrice: 10, markupPct: 20 },
          { description: "Cubierta de techo (zinc galvanizado o aluminio)", unitType: "SQ_FT", quantity: 200, unitPrice: 6, markupPct: 15 },
          { description: "Canaleta pluvial con bajante", unitType: "LINEAR_FT", quantity: 20, unitPrice: 12, markupPct: 20 },
        ],
      },
      {
        category: "Piso",
        items: [
          { description: "Piso antideslizante para exterior", unitType: "SQ_FT", quantity: 200, unitPrice: 8.5, markupPct: 20 },
        ],
      },
      {
        category: "Electrico",
        items: [
          { description: "Sub-panel eléctrico para terraza", unitType: "UNIT", quantity: 1, unitPrice: 550, markupPct: 20 },
          { description: "Iluminación LED empotrada", unitType: "UNIT", quantity: 6, unitPrice: 85, markupPct: 15 },
          { description: "Tomacorrientes GFCI exteriores", unitType: "UNIT", quantity: 3, unitPrice: 125, markupPct: 20 },
        ],
      },
      {
        category: "Pintura",
        items: [
          { description: "Pintura de columnas y vigas", unitType: "SQ_FT", quantity: 100, unitPrice: 3, markupPct: 20 },
          { description: "Sellador impermeabilizante para losa", unitType: "SQ_FT", quantity: 200, unitPrice: 1.5, markupPct: 15 },
        ],
      },
    ],
    defaultNotes: "Cotización incluye materiales y mano de obra. Dimensiones son aproximadas y pueden variar según inspección en sitio. No incluye permisos de construcción (OGPE). Garantía de 1 año en mano de obra.",
  },
  {
    id: "roof-repair",
    name: "Reparación de Techo",
    icon: "🔧",
    description: "Remoción, instalación nueva e impermeabilización",
    sections: [
      {
        category: "Techado",
        items: [
          { description: "Remoción de techo existente (zinc/tejas)", unitType: "SQ_FT", quantity: 500, unitPrice: 2.5, markupPct: 20 },
          { description: "Reparación de estructura de madera/acero dañada", unitType: "LUMP_SUM", quantity: 1, unitPrice: 1200, markupPct: 25 },
          { description: "Instalación de zinc galvanizado calibre 26", unitType: "SQ_FT", quantity: 500, unitPrice: 5.5, markupPct: 15 },
          { description: "Tornillería y sellador de juntas", unitType: "LUMP_SUM", quantity: 1, unitPrice: 350, markupPct: 20 },
          { description: "Impermeabilización (membrana líquida)", unitType: "SQ_FT", quantity: 500, unitPrice: 2, markupPct: 20 },
          { description: "Canaletas y bajantes pluviales", unitType: "LINEAR_FT", quantity: 40, unitPrice: 12, markupPct: 20 },
        ],
      },
    ],
    defaultNotes: "Cotización incluye materiales y mano de obra. Se garantiza impermeabilización por 5 años. Incluye limpieza de área de trabajo al finalizar.",
  },
  {
    id: "block-wall",
    name: "Pared / Muro de Bloque",
    icon: "🧱",
    description: "Cimentación, bloques, pañete y pintura",
    sections: [
      {
        category: "Estructura",
        items: [
          { description: "Excavación para cimentación", unitType: "LINEAR_FT", quantity: 30, unitPrice: 12, markupPct: 20 },
          { description: "Zapata corrida de concreto reforzado", unitType: "LINEAR_FT", quantity: 30, unitPrice: 25, markupPct: 20 },
          { description: "Levante de pared de bloques 6\"", unitType: "SQ_FT", quantity: 180, unitPrice: 8, markupPct: 20 },
          { description: "Varilla de refuerzo vertical y horizontal", unitType: "LINEAR_FT", quantity: 100, unitPrice: 4, markupPct: 20 },
          { description: "Relleno de celdas con concreto", unitType: "SQ_FT", quantity: 180, unitPrice: 2.5, markupPct: 20 },
        ],
      },
      {
        category: "Acabados",
        items: [
          { description: "Pañete de paredes (ambas caras)", unitType: "SQ_FT", quantity: 360, unitPrice: 3.5, markupPct: 20 },
        ],
      },
      {
        category: "Pintura",
        items: [
          { description: "Sellador y pintura exterior (2 manos)", unitType: "SQ_FT", quantity: 360, unitPrice: 2.75, markupPct: 20 },
        ],
      },
    ],
    defaultNotes: "Cotización incluye materiales y mano de obra. Medidas son aproximadas — dimensiones finales se confirman en sitio. No incluye permisos municipales si la pared excede 6 pies de altura.",
  },
  {
    id: "waterproofing",
    name: "Impermeabilización",
    icon: "💧",
    description: "Limpieza, sellador y membrana impermeabilizante",
    sections: [
      {
        category: "Techado",
        items: [
          { description: "Lavado a presión de superficie", unitType: "SQ_FT", quantity: 800, unitPrice: 0.5, markupPct: 25 },
          { description: "Reparación de grietas y fisuras", unitType: "LUMP_SUM", quantity: 1, unitPrice: 600, markupPct: 20 },
          { description: "Aplicación de primer epóxico", unitType: "SQ_FT", quantity: 800, unitPrice: 1.25, markupPct: 20 },
          { description: "Membrana impermeabilizante líquida (2 capas)", unitType: "SQ_FT", quantity: 800, unitPrice: 2.5, markupPct: 20 },
          { description: "Refuerzo en juntas y esquinas con tela de fibra", unitType: "LINEAR_FT", quantity: 100, unitPrice: 3, markupPct: 20 },
          { description: "Capa final reflectiva (cool roof)", unitType: "SQ_FT", quantity: 800, unitPrice: 1.5, markupPct: 15 },
        ],
      },
    ],
    defaultNotes: "Cotización incluye materiales y mano de obra. Se garantiza impermeabilización por 5 años. Productos de calidad comercial/industrial. Trabajo se realiza en días secos.",
  },
];

export function getTemplateById(id: string): QuoteTemplate | undefined {
  return QUOTE_TEMPLATES.find((t) => t.id === id);
}
