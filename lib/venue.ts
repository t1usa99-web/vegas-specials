import { Pool } from "pg";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }
export async function getVenue(id: string): Promise<any> { const p = gp(); if (!p) return null; try { const { rows } = await p.query("SELECT * FROM venues WHERE id=$1", [id]); return rows[0] || null; } catch { return null; } }
export async function getVenueSpecials(id: string): Promise<any[]> { const p = gp(); if (!p) return []; try { const { rows } = await p.query("SELECT * FROM specials WHERE venue_id=$1 AND status='live' AND (valid_until IS NULL OR valid_until >= CURRENT_DATE) ORDER BY confidence DESC, id", [id]); return rows; } catch { return []; } }

export async function getNearby(lat: number, lng: number, excludeId: string, limit = 3): Promise<any[]> {
  const p = gp(); if (!p || lat == null || lng == null) return [];
  try {
    const { rows } = await p.query(
      `SELECT v.id, v.name, v.neighborhood, v.rating, v.photo_ref,
              MIN(sp.price) FILTER (WHERE sp.price IS NOT NULL) AS cheapest, COUNT(sp.id) AS deal_count
       FROM venues v JOIN specials sp ON sp.venue_id = v.id AND sp.status='live' AND (sp.valid_until IS NULL OR sp.valid_until >= CURRENT_DATE)
       WHERE v.id <> $3 AND v.lat IS NOT NULL AND v.lng IS NOT NULL
       GROUP BY v.id
       ORDER BY ((v.lat-$1)*(v.lat-$1)+(v.lng-$2)*(v.lng-$2)) ASC
       LIMIT $4`, [lat, lng, excludeId, limit]);
    return rows;
  } catch { return []; }
}

export async function getChildren(id: string): Promise<any[]> {
  const p = gp(); if (!p) return [];
  try {
    const { rows } = await p.query(
      `SELECT v.id, v.name, v.type, v.rating, v.photo_ref,
              COUNT(s.id) FILTER (WHERE s.status='live' AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE)) AS deal_count
       FROM venues v LEFT JOIN specials s ON s.venue_id = v.id
       WHERE v.parent_id = $1 AND v.merged_into IS NULL
       GROUP BY v.id ORDER BY deal_count DESC, v.rating DESC NULLS LAST`, [id]);
    return rows;
  } catch { return []; }
}
export async function getAggregateSpecials(id: string): Promise<any[]> {
  const p = gp(); if (!p) return [];
  try {
    const { rows } = await p.query(
      `SELECT s.*, v.name AS _venue_name, v.id AS _venue_id
       FROM specials s JOIN venues v ON v.id = s.venue_id
       WHERE (s.venue_id = $1 OR v.parent_id = $1) AND s.status='live' AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE)
       ORDER BY s.confidence DESC, s.id`, [id]);
    return rows;
  } catch { return []; }
}

export async function getMenuItems(id: string): Promise<any[]> {
  const p = gp(); if (!p) return [];
  try {
    const { rows } = await p.query(
      "SELECT name, price, category, section FROM menu_items WHERE venue_id=$1 AND price IS NOT NULL ORDER BY section NULLS LAST, category, price DESC LIMIT 120", [id]);
    return rows;
  } catch { return []; }
}
