import { Pool } from "pg";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

export type Resort = { slug: string; name: string; group?: string; h1: string; title: string; intro: string; match: string };

// Match a property by its own name OR by its parent venue's name (child outlets).
// All patterns are hardcoded here (never user input) -> safe to interpolate.
function byName(patterns: string[]): string {
  return "(" + patterns.map((p) =>
    `v.name ILIKE '%${p}%' OR EXISTS (SELECT 1 FROM venues pp WHERE pp.id = v.parent_id AND pp.name ILIKE '%${p}%')`
  ).join(" OR ") + ")";
}

const P = (slug: string, name: string, intro: string, patterns: string[], group?: string): Resort => ({
  slug, name, group,
  h1: `Happy Hours & Deals at ${name}`,
  title: `${name} Happy Hours, Restaurants & Deals — Las Vegas`,
  intro,
  match: byName(patterns),
});

export const RESORTS: Resort[] = [
  // ---- Individual properties ----
  P("aria", "ARIA", "Every verified happy hour and deal across ARIA's restaurants and bars, in one place.", ["aria"]),
  P("bellagio", "Bellagio", "Verified happy hours and food & drink deals at Bellagio's restaurants and lounges.", ["bellagio"]),
  P("cosmopolitan", "The Cosmopolitan", "Happy hours and deals across The Cosmopolitan of Las Vegas.", ["cosmopolitan"]),
  P("caesars-palace", "Caesars Palace", "Verified happy hours and restaurant deals throughout Caesars Palace.", ["caesars palace"]),
  P("venetian-palazzo", "The Venetian & Palazzo", "Happy hours and deals across The Venetian and Palazzo resort.", ["venetian", "palazzo"]),
  P("mgm-grand", "MGM Grand", "Verified happy hours and food & drink deals at MGM Grand.", ["mgm grand"]),
  P("mandalay-bay", "Mandalay Bay", "Happy hours and deals across Mandalay Bay and Delano.", ["mandalay bay", "delano"]),
  P("park-mgm", "Park MGM", "Verified happy hours and restaurant deals at Park MGM and NoMad.", ["park mgm", "nomad"]),
  P("wynn-encore", "Wynn & Encore", "Happy hours and deals across Wynn and Encore Las Vegas.", ["wynn", "encore"]),
  P("resorts-world", "Resorts World", "Verified happy hours and food & drink deals at Resorts World Las Vegas.", ["resorts world"]),
  P("the-strat", "The STRAT", "Happy hours and locals deals at The STRAT hotel, casino & tower.", ["strat"]),
  P("sahara", "Sahara Las Vegas", "Verified happy hours and restaurant deals at Sahara Las Vegas.", ["sahara"]),
  P("fontainebleau", "Fontainebleau", "Happy hours and deals across Fontainebleau Las Vegas.", ["fontainebleau"]),
  P("durango", "Durango", "Verified happy hours and locals deals at Durango Casino & Resort.", ["durango"]),
  P("red-rock", "Red Rock Resort", "Happy hours and locals deals at Red Rock Casino Resort & Spa.", ["red rock"]),
  P("ellis-island", "Ellis Island", "Verified deals across Ellis Island Casino, Brewery & Restaurant.", ["ellis island"]),

  // ---- Resort group hubs ----
  P("mgm-resorts", "MGM Resorts", "Every verified happy hour across MGM Resorts properties — ARIA, Bellagio, MGM Grand, Mandalay Bay, Park MGM, Cosmopolitan, Excalibur, Luxor and New York-New York.",
    ["aria", "bellagio", "mgm grand", "mandalay bay", "park mgm", "cosmopolitan", "excalibur", "luxor", "new york-new york", "vdara"], "Resort groups"),
  P("caesars-entertainment", "Caesars Entertainment", "Verified happy hours across Caesars properties — Caesars Palace, Paris, Planet Hollywood, Flamingo, Harrah's, The LINQ, Horseshoe and Rio.",
    ["caesars palace", "paris las vegas", "planet hollywood", "flamingo", "harrah", "linq", "horseshoe", "rio all"], "Resort groups"),
  P("station-casinos", "Station Casinos (Locals)", "Verified locals happy hours across Station Casinos — Red Rock, Durango, Green Valley Ranch, Palace Station, Santa Fe, Sunset and Boulder Station.",
    ["red rock", "durango", "green valley ranch", "palace station", "santa fe station", "sunset station", "boulder station"], "Resort groups"),
];

export function getResort(slug: string) { return RESORTS.find((r) => r.slug === slug) || null; }

export async function resortResults(def: Resort): Promise<any[]> {
  const p = gp(); if (!p) return [];
  try {
    const { rows } = await p.query(`
      SELECT v.id, v.name, v.neighborhood, v.rating, v.photo_ref,
        MIN(sp.price) FILTER (WHERE sp.price IS NOT NULL) AS cheapest, COUNT(sp.id) AS deal_count,
        json_agg(json_build_object('summary', sp.summary, 'price', sp.price, 'days', sp.days, 'start', sp.start_time, 'end', sp.end_time, 'outlet', sp.outlet, 'category', sp.category) ORDER BY sp.confidence DESC) AS specials
      FROM specials sp JOIN venues v ON v.id = sp.venue_id
      WHERE sp.status='live' AND (sp.valid_until IS NULL OR sp.valid_until >= CURRENT_DATE) AND (${def.match})
      GROUP BY v.id
      ORDER BY (v.rating IS NULL), v.rating DESC NULLS LAST
      LIMIT 80`);
    return rows;
  } catch (e) { return []; }
}
