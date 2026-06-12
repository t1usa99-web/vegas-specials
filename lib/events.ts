import { Pool } from "pg";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

export async function getUpcomingEvents(opts?: { category?: string; limit?: number }): Promise<any[]> {
  const p = gp(); if (!p) return [];
  const limit = opts?.limit ?? 150;
  try {
    const params: any[] = [];
    let where = "starts_at >= now() AND status='live'";
    if (opts?.category) { params.push(opts.category); where += ` AND category=$${params.length}`; }
    params.push(limit);
    const { rows } = await p.query(
      `SELECT id, name, category, venue_name, starts_at, url, image_url, price_min, price_max
       FROM events WHERE ${where} ORDER BY starts_at ASC LIMIT $${params.length}`, params);
    return rows;
  } catch { return []; }
}

export async function eventCategoryCounts(): Promise<Record<string, number>> {
  const p = gp(); if (!p) return {};
  try {
    const { rows } = await p.query(
      `SELECT category, count(*)::int c FROM events WHERE starts_at >= now() AND status='live' GROUP BY category`);
    return rows.reduce((a: any, r: any) => { a[r.category] = r.c; return a; }, {});
  } catch { return {}; }
}
