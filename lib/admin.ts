import { Pool } from "pg";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

export async function getPendingSubmissions(): Promise<any[]> {
  const p = gp(); if (!p) return [];
  try {
    await p.query("CREATE TABLE IF NOT EXISTS submissions (id SERIAL PRIMARY KEY, venue_guess TEXT, raw_json JSONB, photo_taken_at TIMESTAMPTZ, confidence INTEGER, review_status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now())");
    const { rows } = await p.query("SELECT id, venue_guess, raw_json, created_at FROM submissions WHERE review_status='pending' ORDER BY created_at DESC LIMIT 200");
    return rows;
  } catch { return []; }
}

export async function getFlaggedSpecials(): Promise<any[]> {
  const p = gp(); if (!p) return [];
  try {
    const { rows } = await p.query(
      `SELECT s.id, s.summary, s.days, s.start_time, COALESCE(s.flagged_count,0) flagged_count, COALESCE(s.verified_count,0) verified_count, s.status, v.name venue
       FROM specials s JOIN venues v ON v.id = s.venue_id
       WHERE COALESCE(s.flagged_count,0) > 0 OR s.status='disputed' ORDER BY s.flagged_count DESC NULLS LAST LIMIT 100`);
    return rows;
  } catch { return []; }
}
