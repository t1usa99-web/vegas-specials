import { Pool } from "pg";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }
const GUARD = "s.status='live' AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE)";

export async function searchAll(q: string): Promise<{ venues: any[]; deals: any[]; events: any[] }> {
  const p = gp(); const term = (q || "").trim();
  if (!p || term.length < 2) return { venues: [], deals: [], events: [] };
  const like = `%${term}%`;
  try {
    const venues = p.query(
      `SELECT v.id, v.name, v.neighborhood, v.rating, v.cuisine,
              COUNT(s.id) FILTER (WHERE s.status='live' AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE)) AS deal_count
       FROM venues v LEFT JOIN specials s ON s.venue_id = v.id
       WHERE v.name ILIKE $1 OR v.neighborhood ILIKE $1 OR v.cuisine ILIKE $1 OR v.vibe_tags::text ILIKE $1
       GROUP BY v.id ORDER BY deal_count DESC, (v.rating IS NULL), v.rating DESC LIMIT 14`, [like]);
    const deals = p.query(
      `SELECT s.id, s.summary, s.days, s.start_time, s.end_time, s.price, v.id venue_id, v.name venue, v.neighborhood
       FROM specials s JOIN venues v ON v.id = s.venue_id
       WHERE ${GUARD} AND (s.summary ILIKE $1 OR v.name ILIKE $1) ORDER BY s.confidence DESC LIMIT 30`, [like]);
    const events = p.query(
      `SELECT id, name, venue_name, starts_at, url, category, price_min FROM events
       WHERE starts_at >= now() AND status='live' AND (name ILIKE $1 OR venue_name ILIKE $1)
       ORDER BY starts_at ASC LIMIT 14`, [like]);
    const [v, d, e] = await Promise.all([venues, deals, events]);
    return { venues: v.rows, deals: d.rows, events: e.rows };
  } catch { return { venues: [], deals: [], events: [] }; }
}
