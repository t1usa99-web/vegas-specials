import { Pool } from "pg";
import type { PriceRow } from "./price";

let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

export type DishPage = { dish: string; label: string; venues: number; items: number; min_price: number; max_price: number };

// All auto-generated dish pages with at least `minVenues` venues (gates thin pages).
export async function getDishPages(minVenues = 3): Promise<DishPage[]> {
  const p = gp(); if (!p) return [];
  try {
    const { rows } = await p.query(
      `SELECT dish, dish_label AS label, count(DISTINCT venue_id)::int AS venues, count(*)::int AS items,
              min(price)::numeric AS min_price, max(price)::numeric AS max_price
       FROM menu_items WHERE dish IS NOT NULL AND dish <> '' AND price > 0
       GROUP BY dish, dish_label HAVING count(DISTINCT venue_id) >= $1
       ORDER BY venues DESC, items DESC`, [minVenues]);
    return rows.map((r: any) => ({ ...r, min_price: Number(r.min_price), max_price: Number(r.max_price) }));
  } catch { return []; }
}

export async function getDishMeta(slug: string): Promise<{ dish: string; label: string } | null> {
  const p = gp(); if (!p) return null;
  try {
    const { rows } = await p.query("SELECT dish, dish_label AS label FROM menu_items WHERE dish = $1 AND dish <> '' LIMIT 1", [slug]);
    return rows[0] || null;
  } catch { return null; }
}

// Price comparison for an auto dish: menu_items tagged with this dish, plus any
// live happy-hour special whose item name matches the dish label. Lowest per venue.
export async function getDishComparison(slug: string, label: string): Promise<PriceRow[]> {
  const p = gp(); if (!p) return [];
  const pat = `%${(label || slug.replace(/-/g, " ")).toLowerCase()}%`;
  try {
    const fromMenu = p.query(
      `SELECT v.id venue_id, v.name venue, v.neighborhood, v.lat, v.lng, v.rating,
              mi.price AS price, mi.name AS label, '' AS days, '' AS start_time, '' AS end_time, mi.last_seen_at
       FROM menu_items mi JOIN venues v ON v.id = mi.venue_id
       WHERE mi.dish = $1 AND mi.price > 0`, [slug]);
    const fromSpecials = p.query(
      `SELECT v.id venue_id, v.name venue, v.neighborhood, v.lat, v.lng, v.rating,
              (it->>'price')::numeric AS price, it->>'name' AS label, sp.days, sp.start_time, sp.end_time, sp.last_seen_at
       FROM specials sp JOIN venues v ON v.id = sp.venue_id
       CROSS JOIN LATERAL jsonb_array_elements(COALESCE(sp.items, '[]'::jsonb)) AS it
       WHERE sp.status='live' AND (sp.valid_until IS NULL OR sp.valid_until >= CURRENT_DATE)
         AND (it->>'price') ~ '^[0-9]+(\\.[0-9]+)?$' AND lower(it->>'name') LIKE $2`, [slug, pat]);
    const [a, b] = await Promise.all([fromMenu, fromSpecials]);
    const all = [...a.rows, ...b.rows].map((r: any) => ({ ...r, price: Number(r.price) })).filter((r) => r.price > 0 && r.price < 1000);
    const byVenue = new Map<string, PriceRow>();
    for (const r of all) { const c = byVenue.get(r.venue_id); if (!c || r.price < c.price) byVenue.set(r.venue_id, r); }
    return Array.from(byVenue.values()).sort((x, y) => x.price - y.price);
  } catch { return []; }
}
