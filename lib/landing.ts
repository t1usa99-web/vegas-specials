import { Pool } from "pg";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

export type Landing = { slug: string; h1: string; title: string; intro: string; where: string };

// All `where` clauses are hardcoded here (never user input) -> safe to interpolate.
export const LANDINGS: Landing[] = [
  { slug: "happy-hours-las-vegas-strip", h1: "Best Happy Hours on the Las Vegas Strip", title: "Best Happy Hours on the Las Vegas Strip (Updated Weekly)", intro: "Verified happy hour deals at bars and restaurants on and just off the Strip — with real prices, times, and when each was last confirmed.", where: "sp.category='happy_hour' AND v.neighborhood ILIKE '%Strip%'" },
  { slug: "happy-hours-downtown-las-vegas", h1: "Best Happy Hours in Downtown Las Vegas", title: "Best Happy Hours in Downtown Las Vegas & Fremont", intro: "The freshest happy hour deals in Downtown Las Vegas and the Fremont East district.", where: "sp.category='happy_hour' AND v.neighborhood ILIKE '%Downtown%'" },
  { slug: "happy-hours-arts-district-las-vegas", h1: "Best Happy Hours in the Las Vegas Arts District", title: "Happy Hours in the Las Vegas Arts District (18b)", intro: "Where locals drink — verified happy hours across the Arts District.", where: "sp.category='happy_hour' AND v.neighborhood ILIKE '%Arts%'" },
  { slug: "cheap-drinks-las-vegas", h1: "Cheap Drink Specials in Las Vegas ($6 & Under)", title: "Cheap Drinks in Las Vegas — $6 & Under Specials", intro: "Every verified drink special $6 or less, citywide. Updated automatically as our crawler and locals find new deals.", where: "sp.drink AND sp.price IS NOT NULL AND sp.price <= 6" },
  { slug: "meals-under-10-las-vegas", h1: "Meals & Food Specials Under $10 in Las Vegas", title: "Cheap Eats: Meals Under $10 in Las Vegas", intro: "Real food deals for under ten bucks — steak specials, bites, and more, verified and dated.", where: "sp.food AND sp.price IS NOT NULL AND sp.price <= 10" },
  { slug: "2-for-1-drink-specials-las-vegas", h1: "2-for-1 & BOGO Drink Specials in Las Vegas", title: "2-for-1 Drink Specials in Las Vegas", intro: "Buy-one-get-one and two-for-one drink deals across Las Vegas.", where: "sp.drink AND sp.discount_type IN ('two_for_one','bogo')" },
  { slug: "free-drinks-and-freebies-las-vegas", h1: "Free Drinks & Freebies in Las Vegas", title: "Free Drinks & Freebies in Las Vegas", intro: "Free beers for veterans, players-card perks, comps and other freebies — verified.", where: "sp.freebie" },
  { slug: "late-night-happy-hours-las-vegas", h1: "Late-Night & Reverse Happy Hours in Las Vegas", title: "Late-Night Happy Hours in Las Vegas (After 10pm)", intro: "Vegas runs all night. These spots run a second, later discount window.", where: "sp.reverse_window IS NOT NULL AND sp.reverse_window <> ''" },
];

export function getLanding(slug: string) { return LANDINGS.find((l) => l.slug === slug) || null; }

export async function landingResults(def: Landing): Promise<any[]> {
  const p = gp(); if (!p) return [];
  try {
    const { rows } = await p.query(`
      SELECT v.id, v.name, v.neighborhood, v.rating, v.photo_ref,
        MIN(sp.price) FILTER (WHERE sp.price IS NOT NULL) AS cheapest, COUNT(sp.id) AS deal_count,
        json_agg(json_build_object('summary', sp.summary, 'price', sp.price, 'days', sp.days, 'start', sp.start_time, 'end', sp.end_time, 'outlet', sp.outlet) ORDER BY sp.confidence DESC) AS specials
      FROM specials sp JOIN venues v ON v.id = sp.venue_id
      WHERE sp.status='live' AND (${def.where})
      GROUP BY v.id
      ORDER BY (v.rating IS NULL), v.rating DESC NULLS LAST
      LIMIT 60`);
    return rows;
  } catch (e) { return []; }
}
