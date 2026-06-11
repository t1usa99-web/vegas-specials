import { Pool } from "pg";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }
export async function getVenue(id: string): Promise<any> { const p = gp(); if (!p) return null; try { const { rows } = await p.query("SELECT * FROM venues WHERE id=$1", [id]); return rows[0] || null; } catch { return null; } }
export async function getVenueSpecials(id: string): Promise<any[]> { const p = gp(); if (!p) return []; try { const { rows } = await p.query("SELECT * FROM specials WHERE venue_id=$1 AND status='live' ORDER BY confidence DESC, id", [id]); return rows; } catch { return []; } }
