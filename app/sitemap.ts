import type { MetadataRoute } from "next";
import { LANDINGS } from "@/lib/landing";
import { RESORTS } from "@/lib/resorts";
import { TRACKED } from "@/lib/price";
import { Pool } from "pg";

export const revalidate = 86400;
const BASE = "https://vegasontap.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const core = ["", "/best", "/resort", "/price", "/events", "/map", "/blog"].map((p) => ({ url: BASE + p }));
  const land = LANDINGS.map((l) => ({ url: `${BASE}/best/${l.slug}` }));
  const res = RESORTS.map((r) => ({ url: `${BASE}/resort/${r.slug}` }));
  const price = TRACKED.map((t) => ({ url: `${BASE}/price/${t.slug}` }));
  let venues: { url: string }[] = [];
  if (process.env.DATABASE_URL) {
    try {
      const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
      const { rows } = await pool.query(
        `SELECT DISTINCT v.id FROM venues v JOIN specials s ON s.venue_id = v.id
         AND s.status='live' AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE)`);
      venues = rows.map((r: any) => ({ url: `${BASE}/venue/${r.id}` }));
      await pool.end();
    } catch { /* build without DB is fine */ }
  }
  return [...core, ...land, ...res, ...price, ...venues];
}
