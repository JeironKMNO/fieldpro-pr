/**
 * Price Search Service
 * Priority: 1) SerpAPI Home Depot search  2) Local price database  3) Estimate
 */

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface MaterialPrice {
  name: string;
  price: number;
  unit: string;
  store: string;
  quantity: number;
  subtotal: number;
  source: "homedepot" | "database" | "estimated";
  url?: string;
  thumbnail?: string;
}

interface SerpApiProduct {
  title: string;
  price: number;
  link: string;
  brand?: string;
  product_id?: string;
  rating?: number;
  reviews?: number;
  thumbnail?: string;
}

// ═══════════════════════════════════════════════════════════════
// In-memory cache (TTL 4 hours)
// ═══════════════════════════════════════════════════════════════

const priceCache = new Map<
  string,
  { products: SerpApiProduct[]; expiresAt: number }
>();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function getCached(query: string): SerpApiProduct[] | null {
  const entry = priceCache.get(query.toLowerCase());
  if (entry && Date.now() < entry.expiresAt) {
    return entry.products;
  }
  if (entry) priceCache.delete(query.toLowerCase());
  return null;
}

function setCache(query: string, products: SerpApiProduct[]) {
  priceCache.set(query.toLowerCase(), {
    products,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// ═══════════════════════════════════════════════════════════════
// SerpAPI Home Depot Search
// ═══════════════════════════════════════════════════════════════

const SERPAPI_KEY = process.env.SERPAPI_API_KEY ?? "";

async function searchHomeDepotViaSerpApi(
  query: string
): Promise<SerpApiProduct[]> {
  if (!SERPAPI_KEY) {
    console.warn(
      "[PriceSearch] SERPAPI_API_KEY not configured, skipping Home Depot search"
    );
    return [];
  }

  // Check cache first
  const cached = getCached(query);
  if (cached) return cached;

  const params = new URLSearchParams({
    engine: "home_depot",
    q: query,
    api_key: SERPAPI_KEY,
    ps: "5", // top 5 results
    delivery_zip: "00901", // San Juan, PR
    store_id: "6408", // Home Depot Monte Hiedra, San Juan, PR
  });

  try {
    const response = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.warn(
        `[PriceSearch] SerpAPI returned ${response.status}: ${errorText.slice(0, 200)}`
      );
      return [];
    }

    const data = await response.json();
    const products: SerpApiProduct[] = [];

    if (data.products && Array.isArray(data.products)) {
      for (const product of data.products.slice(0, 3)) {
        if (product.price && product.price > 0) {
          // Extract best thumbnail: prefer 300px, fallback to first available
          let thumbnail: string | undefined;
          if (product.thumbnails && Array.isArray(product.thumbnails)) {
            // thumbnails is array of URL strings at various resolutions
            const thumbs = product.thumbnails as string[];
            // Pick a mid-size image (300px or 400px) for good quality without being huge
            thumbnail =
              thumbs.find((t: string) => t.includes("300")) ??
              thumbs.find((t: string) => t.includes("400")) ??
              thumbs.find((t: string) => t.includes("145")) ??
              thumbs[0];
          } else if (product.thumbnail) {
            thumbnail = product.thumbnail as string;
          }

          products.push({
            title: product.title ?? query,
            price: product.price,
            link:
              product.link ??
              `https://www.homedepot.com/s/${encodeURIComponent(query)}`,
            brand: product.brand,
            product_id: product.product_id,
            rating: product.rating,
            reviews: product.reviews,
            thumbnail,
          });
        }
      }
    }

    // Cache even empty results to avoid hammering the API
    setCache(query, products);
    return products;
  } catch (error) {
    console.warn(
      `[PriceSearch] SerpAPI search failed for "${query}":`,
      error instanceof Error ? error.message : error
    );
    return [];
  }
}

/**
 * Parse the unit from a product title or description.
 * e.g. "per sq. ft.", "/each", "per piece"
 */
function inferUnit(title: string, defaultUnit: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("sq") && lower.includes("ft")) return "sq ft";
  if (lower.includes("lin") && lower.includes("ft")) return "lin ft";
  if (lower.includes("cu") && lower.includes("yd")) return "cu yd";
  if (lower.includes("/piece") || lower.includes("per piece")) return "piece";
  if (lower.includes("/bag") || lower.includes("per bag")) return "bag";
  if (lower.includes("gallon") || lower.includes("gal")) return "gallon";
  if (lower.includes("/roll") || lower.includes("per roll")) return "roll";
  if (lower.includes("bundle")) return "bundle";
  if (lower.includes("sheet")) return "sheet";
  if (lower.includes("box")) return "box";
  return defaultUnit || "each";
}

// ═══════════════════════════════════════════════════════════════
// Local Price Database (Fallback)
// ═══════════════════════════════════════════════════════════════

const PRICE_DATABASE: Record<
  string,
  { price: number; unit: string; store: string }
> = {
  // Concrete & Masonry
  "cement bag 94lb": { price: 12.98, unit: "bag", store: "Home Depot PR" },
  "cement bag": { price: 12.98, unit: "bag", store: "Home Depot PR" },
  "concrete block 6 inch": {
    price: 1.85,
    unit: "unit",
    store: "Home Depot PR",
  },
  "concrete block 8 inch": {
    price: 2.45,
    unit: "unit",
    store: "Home Depot PR",
  },
  "rebar #3": { price: 4.5, unit: "piece (20ft)", store: "Ferretería local" },
  "rebar #4": { price: 7.98, unit: "piece (20ft)", store: "Ferretería local" },
  "sand cubic yard": { price: 45.0, unit: "cubic yard", store: "Materialista" },
  "gravel cubic yard": {
    price: 55.0,
    unit: "cubic yard",
    store: "Materialista",
  },
  "ready mix concrete": { price: 165.0, unit: "cubic yard", store: "CEMEX PR" },

  // Lumber
  "2x4 lumber 8ft": { price: 5.98, unit: "piece", store: "Home Depot PR" },
  "2x4 lumber 10ft": { price: 7.48, unit: "piece", store: "Home Depot PR" },
  "2x4 lumber 12ft": { price: 8.98, unit: "piece", store: "Home Depot PR" },
  "2x6 lumber 8ft": { price: 9.98, unit: "piece", store: "Home Depot PR" },
  "2x6 lumber 12ft": { price: 14.98, unit: "piece", store: "Home Depot PR" },
  "plywood 4x8 1/2": { price: 32.98, unit: "sheet", store: "Home Depot PR" },
  "plywood 4x8 3/4": { price: 45.98, unit: "sheet", store: "Home Depot PR" },
  "osb 4x8 7/16": { price: 22.98, unit: "sheet", store: "Home Depot PR" },

  // Plumbing
  "pvc pipe 1/2 inch": { price: 3.48, unit: "10ft", store: "Home Depot PR" },
  "pvc pipe 3/4 inch": { price: 4.98, unit: "10ft", store: "Home Depot PR" },
  "pvc pipe 2 inch": { price: 9.98, unit: "10ft", store: "Home Depot PR" },
  "pvc pipe 4 inch": { price: 14.98, unit: "10ft", store: "Home Depot PR" },
  "cpvc pipe 1/2 inch": { price: 5.48, unit: "10ft", store: "Home Depot PR" },
  "toilet standard": { price: 189.0, unit: "unit", store: "Home Depot PR" },
  "bathroom sink": { price: 85.0, unit: "unit", store: "Home Depot PR" },
  "kitchen faucet": { price: 129.0, unit: "unit", store: "Home Depot PR" },

  // Electrical
  "romex 12/2 wire": {
    price: 78.98,
    unit: "250ft roll",
    store: "Home Depot PR",
  },
  "romex 14/2 wire": {
    price: 58.98,
    unit: "250ft roll",
    store: "Home Depot PR",
  },
  "electrical outlet": { price: 1.98, unit: "unit", store: "Home Depot PR" },
  "light switch": { price: 1.48, unit: "unit", store: "Home Depot PR" },
  "circuit breaker 20a": { price: 8.98, unit: "unit", store: "Home Depot PR" },
  "electrical panel 200a": {
    price: 189.0,
    unit: "unit",
    store: "Home Depot PR",
  },
  "led bulb": { price: 3.98, unit: "unit", store: "Home Depot PR" },

  // Roofing
  "galvalume roofing sheet": {
    price: 28.0,
    unit: "sheet (10ft)",
    store: "Ferretería local",
  },
  "roofing nail": { price: 45.0, unit: "box (50lb)", store: "Home Depot PR" },
  "roof sealant": { price: 12.98, unit: "tube", store: "Home Depot PR" },
  "roof coating 5gal": { price: 89.0, unit: "bucket", store: "Home Depot PR" },
  "asphalt shingles bundle": {
    price: 35.98,
    unit: "bundle",
    store: "Home Depot PR",
  },

  // Flooring
  "ceramic tile 12x12": { price: 1.89, unit: "sq ft", store: "Home Depot PR" },
  "ceramic tile 18x18": { price: 2.49, unit: "sq ft", store: "Home Depot PR" },
  "porcelain tile 24x24": {
    price: 3.49,
    unit: "sq ft",
    store: "Home Depot PR",
  },
  "tile grout 25lb": { price: 18.98, unit: "bag", store: "Home Depot PR" },
  "tile mortar 50lb": { price: 12.98, unit: "bag", store: "Home Depot PR" },
  "laminate flooring": { price: 2.49, unit: "sq ft", store: "Home Depot PR" },
  "vinyl plank flooring": {
    price: 2.99,
    unit: "sq ft",
    store: "Home Depot PR",
  },

  // Paint
  "interior paint gallon": {
    price: 32.98,
    unit: "gallon",
    store: "Home Depot PR",
  },
  "exterior paint gallon": {
    price: 38.98,
    unit: "gallon",
    store: "Home Depot PR",
  },
  "primer gallon": { price: 24.98, unit: "gallon", store: "Home Depot PR" },
  "paint roller": { price: 7.98, unit: "kit", store: "Home Depot PR" },
  "painter tape": { price: 5.98, unit: "roll", store: "Home Depot PR" },
  "epoxy paint gallon": {
    price: 45.98,
    unit: "gallon",
    store: "Home Depot PR",
  },

  // Windows & Doors
  "aluminum window 3x3": {
    price: 125.0,
    unit: "unit",
    store: "Ferretería local",
  },
  "aluminum window 4x4": {
    price: 175.0,
    unit: "unit",
    store: "Ferretería local",
  },
  "interior door": { price: 89.0, unit: "unit", store: "Home Depot PR" },
  "exterior door steel": { price: 289.0, unit: "unit", store: "Home Depot PR" },
  "sliding glass door": { price: 499.0, unit: "unit", store: "Home Depot PR" },

  // Drywall & Finishing
  "drywall 4x8 1/2": { price: 14.98, unit: "sheet", store: "Home Depot PR" },
  "drywall 4x8 5/8": { price: 17.98, unit: "sheet", store: "Home Depot PR" },
  "joint compound 5gal": {
    price: 18.98,
    unit: "bucket",
    store: "Home Depot PR",
  },
  "drywall tape": { price: 6.98, unit: "roll", store: "Home Depot PR" },
  "corner bead 8ft": { price: 3.48, unit: "piece", store: "Home Depot PR" },

  // Labor rates (Puerto Rico typical rates 2024-2025)
  "general labor": { price: 20.0, unit: "hour", store: "PR Market Rate" },
  "skilled labor": { price: 28.0, unit: "hour", store: "PR Market Rate" },
  electrician: { price: 45.0, unit: "hour", store: "PR Market Rate" },
  plumber: { price: 45.0, unit: "hour", store: "PR Market Rate" },
  painter: { price: 25.0, unit: "hour", store: "PR Market Rate" },
  "tile installer": { price: 35.0, unit: "hour", store: "PR Market Rate" },
  "demolition labor": { price: 22.0, unit: "hour", store: "PR Market Rate" },

  // Logistics & Miscellaneous
  "dumpster rental 20yd": {
    price: 350.0,
    unit: "rental",
    store: "Waste Management PR",
  },
  "dumpster rental 10yd": {
    price: 250.0,
    unit: "rental",
    store: "Waste Management PR",
  },
  "mobilization standard": {
    price: 150.0,
    unit: "lump sum",
    store: "Logistics",
  },
  "mobilization heavy / high floor": {
    price: 350.0,
    unit: "lump sum",
    store: "Logistics",
  },
  "permit fee basic": { price: 250.0, unit: "lump sum", store: "ARPE/OGPe" },
  "cleaning post-construction": {
    price: 1.5,
    unit: "sq ft",
    store: "PR Market Rate",
  },
};

function searchLocalDatabase(
  searchKey: string
): { price: number; unit: string; store: string } | null {
  // Exact match
  if (PRICE_DATABASE[searchKey]) return PRICE_DATABASE[searchKey];

  // Partial match
  const keys = Object.keys(PRICE_DATABASE);
  const partial = keys.find(
    (k) => searchKey.includes(k) || k.includes(searchKey)
  );
  if (partial) return PRICE_DATABASE[partial];

  // Word-level fuzzy match
  const searchWords = searchKey.split(/\s+/);
  let bestMatch: string | null = null;
  let bestScore = 0;

  for (const key of keys) {
    const keyWords = key.split(/\s+/);
    const matchingWords = searchWords.filter((w) =>
      keyWords.some((kw) => kw.includes(w) || w.includes(kw))
    );
    const score =
      matchingWords.length / Math.max(searchWords.length, keyWords.length);
    if (score > bestScore && score >= 0.4) {
      bestScore = score;
      bestMatch = key;
    }
  }

  return bestMatch ? PRICE_DATABASE[bestMatch] : null;
}

// ═══════════════════════════════════════════════════════════════
// Category-based price estimation (last resort)
// ═══════════════════════════════════════════════════════════════

function estimatePrice(name: string): number {
  const lower = name.toLowerCase();
  if (
    lower.includes("cement") ||
    lower.includes("concrete") ||
    lower.includes("cemento")
  )
    return 12.0;
  if (lower.includes("block") || lower.includes("bloque")) return 2.0;
  if (lower.includes("rebar") || lower.includes("varilla")) return 6.0;
  if (
    lower.includes("lumber") ||
    lower.includes("madera") ||
    lower.includes("2x")
  )
    return 8.0;
  if (lower.includes("plywood") || lower.includes("sheet")) return 35.0;
  if (lower.includes("pipe") || lower.includes("tubo") || lower.includes("pvc"))
    return 8.0;
  if (lower.includes("wire") || lower.includes("cable")) return 65.0;
  if (lower.includes("paint") || lower.includes("pintura")) return 35.0;
  if (
    lower.includes("tile") ||
    lower.includes("loseta") ||
    lower.includes("ceramica")
  )
    return 2.5;
  if (lower.includes("door") || lower.includes("puerta")) return 150.0;
  if (lower.includes("window") || lower.includes("ventana")) return 150.0;
  if (
    lower.includes("nail") ||
    lower.includes("screw") ||
    lower.includes("clavo") ||
    lower.includes("tornillo")
  )
    return 12.0;
  if (lower.includes("labor") || lower.includes("mano de obra")) return 22.0;
  if (lower.includes("drywall") || lower.includes("sheetrock")) return 16.0;
  if (
    lower.includes("grout") ||
    lower.includes("mortar") ||
    lower.includes("mezcla")
  )
    return 15.0;
  if (lower.includes("primer") || lower.includes("sellador")) return 25.0;
  return 15.0;
}

// ═══════════════════════════════════════════════════════════════
// Main Search Function
// Priority: 1) SerpAPI Home Depot  2) Local DB  3) Estimate
// ═══════════════════════════════════════════════════════════════

export async function searchMaterialPrices(
  materials: { name: string; quantity: number; unit: string }[]
): Promise<MaterialPrice[]> {
  const results: MaterialPrice[] = [];

  // Process materials with concurrency limit to respect API rate limits
  const BATCH_SIZE = 3;
  for (let i = 0; i < materials.length; i += BATCH_SIZE) {
    const batch = materials.slice(i, i + BATCH_SIZE);

    const batchResults = await Promise.all(
      batch.map(async (material) => {
        const searchKey = material.name.toLowerCase().trim();

        // ── Priority 1: SerpAPI Home Depot search ──
        try {
          const hdProducts = await searchHomeDepotViaSerpApi(material.name);
          if (hdProducts.length > 0) {
            const best = hdProducts[0];
            return {
              name: best.title,
              price: best.price,
              unit: inferUnit(best.title, material.unit),
              store: best.brand ? `Home Depot — ${best.brand}` : "Home Depot",
              quantity: material.quantity,
              subtotal: Math.round(best.price * material.quantity * 100) / 100,
              source: "homedepot" as const,
              url: best.link,
              thumbnail: best.thumbnail,
            };
          }
        } catch (error) {
          console.warn(
            `[PriceSearch] SerpAPI failed for "${material.name}":`,
            error
          );
        }

        // ── Priority 2: Local price database ──
        const localResult = searchLocalDatabase(searchKey);
        if (localResult) {
          return {
            name: material.name,
            price: localResult.price,
            unit: localResult.unit,
            store: localResult.store,
            quantity: material.quantity,
            subtotal:
              Math.round(localResult.price * material.quantity * 100) / 100,
            source: "database" as const,
            url: `https://www.homedepot.com/s/${encodeURIComponent(material.name)}`,
          };
        }

        // ── Priority 3: Estimate ──
        const estimated = estimatePrice(material.name);
        return {
          name: material.name,
          price: estimated,
          unit: material.unit,
          store: "Estimado — verificar en Home Depot",
          quantity: material.quantity,
          subtotal: Math.round(estimated * material.quantity * 100) / 100,
          source: "estimated" as const,
          url: `https://www.homedepot.com/s/${encodeURIComponent(material.name)}`,
        };
      })
    );

    results.push(...batchResults);

    // Delay between batches to respect API rate limits
    if (i + BATCH_SIZE < materials.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return results;
}
