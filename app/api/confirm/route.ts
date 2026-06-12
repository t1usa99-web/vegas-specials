import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

export async function POST(req: NextRequest) {
  let b: any = {}; try { b = await req.json(); } catch { /* */ }
  const id = Number(b.id);
  const vote = b.vote === "flag" ? "flag" : "confirm";
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const p = gp(); if (!p) return NextResponse.json({ ok: true, offline: true });
  try {
    let row;
    if (vote === "confirm") {
      ({ rows: [row] } = await p.query(
        `UPDATE specials SET verified_count = COALESCE(verified_count,0)+1, last_verified_at = now()
         WHERE id=$1 RETURNING verified_count, flagged_count`, [id]));
    } else {
      ({ rows: [row] } = await p.query(
        `UPDATE specials SET flagged_count = COALESCE(flagged_count,0)+1 WHERE id=$1
         RETURNING verified_count, flagged_count`, [id]));
      // auto-dispute once flags clearly outweigh confirms
      if (row && row.flagged_count >= 3 && row.flagged_count > (row.verified_count || 0)) {
        await p.query("UPDATE specials SET status='disputed' WHERE id=$1", [id]);
      }
    }
    return NextResponse.json({ ok: true, verified: row?.verified_count ?? 0, flagged: row?.flagged_count ?? 0 });
  } catch { return NextResponse.json({ error: "could not record" }, { status: 500 }); }
}
