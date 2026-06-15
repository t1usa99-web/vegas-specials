import { NextResponse } from "next/server";
import { Pool } from "pg";
import { LANDINGS } from "@/lib/landing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

// GET /api/health            -> lightweight: DB up + core counts (for uptime monitors)
// GET /api/health?full=1     -> also runs every guide's filter, flagging any that
//                               ERROR (a real bug, like a bad WHERE clause) vs. just
//                               return zero rows (which can be legitimately thin).
export async function GET(req: Request) {
  const full = new URL(req.url).searchParams.get("full") === "1";
  const p = gp();
  if (!p) return NextResponse.json({ ok: false, error: "no database" }, { status: 503 });
  try {
    const c = await p.query(`SELECT
      (SELECT count(*) FROM venues WHERE merged_into IS NULL)::int AS venues,
      (SELECT count(*) FROM specials WHERE status='live')::int AS live_specials,
      (SELECT count(*) FROM menu_items)::int AS menu_items`);
    const counts = c.rows[0];
    const healthy = counts.live_specials > 0 && counts.venues > 0;
    if (!full) return NextResponse.json({ ok: healthy, counts, ts: new Date().toISOString() }, { status: healthy ? 200 : 503 });

    const broken: { slug: string; error: string }[] = [];
    const empty: string[] = [];
    for (const l of LANDINGS) {
      try {
        const r = await p.query(`SELECT count(*)::int n FROM specials sp JOIN venues v ON v.id = sp.venue_id WHERE sp.status='live' AND (sp.valid_until IS NULL OR sp.valid_until >= CURRENT_DATE) AND (${l.where})`);
        if (r.rows[0].n === 0) empty.push(l.slug);
      } catch (e: any) { broken.push({ slug: l.slug, error: String(e?.message || e).slice(0, 140) }); }
    }
    const ok = healthy && broken.length === 0;
    return NextResponse.json({ ok, counts, brokenGuides: broken, emptyGuides: empty, ts: new Date().toISOString() }, { status: ok ? 200 : 503 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: String(e?.message || e).slice(0, 200) }, { status: 503 });
  }
}
