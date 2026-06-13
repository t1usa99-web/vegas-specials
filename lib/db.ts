import { Pool } from "pg";
import { SEED, Special } from "./seedData";

let pool: Pool | null = null;
function getPool(): Pool | null {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

// Returns live specials. Falls back to seed data when no DB is attached,
// so the app deploys and renders before Postgres is wired up.
export async function getSpecials(): Promise<Special[]> {
  const p = getPool();
  if (!p) return SEED;
  try {
    const { rows } = await p.query(
      `SELECT s.*, v.name AS venue, v.type, v.neighborhood, v.walk_min
       FROM specials s JOIN venues v ON v.id = s.venue_id
       WHERE s.status = 'live' AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE)
       ORDER BY s.confidence DESC`
    );
    if (!rows.length) return SEED;
    return rows.map((r: any) => ({
      id: r.id, venue_id: r.venue_id, venue: r.venue, type: r.type, neighborhood: r.neighborhood,
      walk_min: r.walk_min ?? 0, category: r.category, summary: r.summary,
      food: r.food, drink: r.drink, freebie: r.freebie,
      days: r.days, start_time: r.start_time, end_time: r.end_time,
      fine_print: r.fine_print, source: r.source, confidence: r.confidence,
      status: r.status, last_verified_at: r.last_verified_at,
      source_url: r.source_url, verified_count: r.verified_count, last_seen_at: r.last_seen_at,
      price: r.price, discount_type: r.discount_type, items: r.items,
    }));
  } catch (e) {
    console.error("DB query failed, using seed:", e);
    return SEED;
  }
}

export async function dbReady(): Promise<boolean> {
  const p = getPool();
  if (!p) return false;
  try { await p.query("SELECT 1"); return true; } catch { return false; }
}
