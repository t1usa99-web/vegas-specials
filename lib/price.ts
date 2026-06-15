import { Pool } from "pg";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

export type TrackedItem = { slug: string; label: string; h1: string; intro: string; keywords: string[] };

// Per-item price comparisons. Keywords are matched against both the structured
// items[] menu data and the special's summary text. All hardcoded — safe.
export const TRACKED: TrackedItem[] = [
  { slug: "coors-light", label: "Coors Light", h1: "Coors Light Prices in Las Vegas", intro: "Every verified Coors Light price in Las Vegas, cheapest first. Sort by price, distance or how recently it was confirmed.", keywords: ["coors light", "coors"] },
  { slug: "bud-light", label: "Bud Light", h1: "Bud Light Prices in Las Vegas", intro: "Where to find the cheapest Bud Light in Las Vegas right now.", keywords: ["bud light"] },
  { slug: "michelob-ultra", label: "Michelob Ultra", h1: "Michelob Ultra Prices in Las Vegas", intro: "Verified Michelob Ultra prices across Las Vegas, sortable.", keywords: ["michelob ultra", "mich ultra"] },
  { slug: "modelo", label: "Modelo", h1: "Modelo Prices in Las Vegas", intro: "Where to find cheap Modelo in Las Vegas.", keywords: ["modelo"] },
  { slug: "draft-beer", label: "Draft Beer", h1: "Cheapest Draft Beer in Las Vegas", intro: "Every verified draft / draught beer price in Las Vegas, cheapest first.", keywords: ["draft", "draught", "draft beer", "pint"] },
  { slug: "domestic-beer", label: "Domestic Beer", h1: "Cheapest Domestic Beer in Las Vegas", intro: "Domestic beer prices across Las Vegas, sortable.", keywords: ["domestic beer", "domestic"] },
  { slug: "well-drink", label: "Well Drink", h1: "Cheapest Well Drinks in Las Vegas", intro: "Well drinks and well cocktails, cheapest first.", keywords: ["well drink", "well cocktail", "wells", "well shot"] },
  { slug: "house-wine", label: "House Wine", h1: "Cheapest Glass of Wine in Las Vegas", intro: "House wine and wine-by-the-glass prices across Las Vegas.", keywords: ["house wine", "glass of wine", "wine by the glass"] },
  { slug: "margarita", label: "Margarita", h1: "Cheapest Margaritas in Las Vegas", intro: "Every verified margarita price in Las Vegas, sortable.", keywords: ["margarita"] },
  { slug: "mimosa", label: "Mimosa", h1: "Cheapest Mimosas & Bottomless Mimosas in Las Vegas", intro: "Mimosa and bottomless-mimosa prices across Las Vegas.", keywords: ["mimosa"] },
  { slug: "martini", label: "Martini", h1: "Cheapest Martinis in Las Vegas", intro: "Verified martini prices across Las Vegas.", keywords: ["martini"] },
  { slug: "oysters", label: "Oysters", h1: "Cheapest Oysters in Las Vegas", intro: "Where to find dollar oysters and the cheapest oysters in Las Vegas.", keywords: ["oyster"] },
  { slug: "steak", label: "Steak", h1: "Steak Prices in Las Vegas — Cheapest to Most Expensive", intro: "Every steak price we can find across Las Vegas — sort low to high, or high to low for the priciest cuts in town.", keywords: ["steak", "ribeye", "filet", "new york strip", "porterhouse", "sirloin", "wagyu"] },
  { slug: "lobster", label: "Lobster", h1: "Lobster Prices in Las Vegas", intro: "Lobster and lobster tail prices across Las Vegas, sortable.", keywords: ["lobster"] },
  { slug: "burger", label: "Burger", h1: "Burger Prices in Las Vegas", intro: "From cheap sliders to $100 burgers — every burger price in Las Vegas, sortable.", keywords: ["burger"] },
  { slug: "wings", label: "Wings", h1: "Chicken Wing Prices in Las Vegas", intro: "Wing prices across Las Vegas bars and restaurants.", keywords: ["wing"] },
  { slug: "dessert", label: "Dessert", h1: "Dessert Prices in Las Vegas", intro: "Dessert prices across Las Vegas — including the over-the-top ones.", keywords: ["dessert", "cake", "cheesecake", "creme brulee", "sundae", "gelato", "tiramisu"] },
  { slug: "cocktail", label: "Cocktail", h1: "Cocktail Prices in Las Vegas", intro: "Cocktail prices across Las Vegas, cheapest first (or priciest).", keywords: ["cocktail", "old fashioned", "negroni", "manhattan", "espresso martini"] },
];

export function getTracked(slug: string) { return TRACKED.find((t) => t.slug === slug) || null; }

export type PriceRow = { venue_id: string; venue: string; neighborhood: string; lat: number | null; lng: number | null; rating: number | null; price: number; label: string; days: string; start_time: string; end_time: string; last_seen_at: string | null };

export async function getPriceComparison(item: TrackedItem): Promise<PriceRow[]> {
  const p = gp(); if (!p) return [];
  const pats = item.keywords.map((k) => `%${k.toLowerCase()}%`);
  const guard = "sp.status='live' AND (sp.valid_until IS NULL OR sp.valid_until >= CURRENT_DATE)";
  try {
    const fromItems = p.query(
      `SELECT v.id venue_id, v.name venue, v.neighborhood, v.lat, v.lng, v.rating,
              (it->>'price')::numeric AS price, it->>'name' AS label,
              sp.days, sp.start_time, sp.end_time, sp.last_seen_at
       FROM specials sp JOIN venues v ON v.id = sp.venue_id
       CROSS JOIN LATERAL jsonb_array_elements(COALESCE(sp.items, '[]'::jsonb)) AS it
       WHERE ${guard} AND (it->>'price') ~ '^[0-9]+(\\.[0-9]+)?$'
         AND lower(it->>'name') LIKE ANY($1)
         AND lower(it->>'name') !~ 'taco|burrito|quesadilla|torta|nacho|empanada|cheesesteak|philly|fried rice|ramen|spring roll|egg roll|dumpling|pizza|sandwich|wrap|slider'`, [pats]);
    const fromSummary = p.query(
      `SELECT v.id venue_id, v.name venue, v.neighborhood, v.lat, v.lng, v.rating,
              sp.price AS price, sp.summary AS label,
              sp.days, sp.start_time, sp.end_time, sp.last_seen_at
       FROM specials sp JOIN venues v ON v.id = sp.venue_id
       WHERE ${guard} AND sp.price IS NOT NULL AND lower(sp.summary) LIKE ANY($1) AND lower(sp.summary) !~ 'taco|burrito|quesadilla|torta|nacho|empanada|cheesesteak|philly|fried rice|ramen|spring roll|egg roll|dumpling|pizza|sandwich|wrap|slider'`, [pats]);
    const fromMenu = p.query(
      `SELECT v.id venue_id, v.name venue, v.neighborhood, v.lat, v.lng, v.rating,
              mi.price AS price, mi.name AS label, '' AS days, '' AS start_time, '' AS end_time, mi.last_seen_at
       FROM menu_items mi JOIN venues v ON v.id = mi.venue_id
       WHERE mi.price > 0 AND mi.dish IS NOT NULL AND mi.dish <> '' AND (lower(mi.dish_label) LIKE ANY($1) OR lower(mi.dish) LIKE ANY($1))`, [pats]);
    const fromDish = p.query(
      `SELECT v.id venue_id, v.name venue, v.neighborhood, v.lat, v.lng, v.rating,
              mi.price AS price, mi.name AS label, '' AS days, '' AS start_time, '' AS end_time, mi.last_seen_at
       FROM menu_items mi JOIN venues v ON v.id = mi.venue_id
       WHERE mi.dish = $1 AND mi.price > 0`, [item.slug]);
    const [a, b, c, d] = await Promise.all([fromItems, fromSummary, fromMenu, fromDish]);
    const all = [...a.rows, ...b.rows, ...c.rows, ...d.rows].map((r: any) => ({ ...r, price: Number(r.price) })).filter((r) => r.price > 0 && r.price < 1000);
    // keep the lowest price per venue
    const byVenue = new Map<string, PriceRow>();
    for (const r of all) {
      const cur = byVenue.get(r.venue_id);
      if (!cur || r.price < cur.price) byVenue.set(r.venue_id, r);
    }
    return Array.from(byVenue.values()).sort((x, y) => x.price - y.price);
  } catch (e) { return []; }
}
