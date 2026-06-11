import { NextResponse } from "next/server";
import { Pool } from "pg";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
let pool: Pool | null = null;
function getPool() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

export async function GET() {
  const p = getPool();
  if (!p) return NextResponse.json({ venues: [] });
  try {
    const { rows } = await p.query(`
      SELECT v.id, v.name, v.neighborhood, v.lat, v.lng, v.rating, v.price_level, v.walk_min,
        MIN(sp.price) FILTER (WHERE sp.price IS NOT NULL) AS cheapest,
        COUNT(sp.id) AS deal_count,
        json_agg(json_build_object('summary', sp.summary, 'price', sp.price, 'food', sp.food, 'drink', sp.drink, 'freebie', sp.freebie, 'days', sp.days, 'start', sp.start_time, 'end', sp.end_time) ORDER BY sp.confidence DESC) AS specials
      FROM venues v JOIN specials sp ON sp.venue_id = v.id AND sp.status = 'live'
      WHERE v.lat IS NOT NULL AND v.lng IS NOT NULL
      GROUP BY v.id`);
    return NextResponse.json({ venues: rows });
  } catch (e) { return NextResponse.json({ venues: [], error: String(e) }, { status: 500 }); }
}
