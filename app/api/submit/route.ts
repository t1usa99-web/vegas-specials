import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }
const clip = (v: any, n: number) => (typeof v === "string" ? v.trim().slice(0, n) : "");

export async function POST(req: NextRequest) {
  let b: any = {}; try { b = await req.json(); } catch { /* empty */ }
  const venue = clip(b.venue, 160);
  const summary = clip(b.summary, 300);
  if (!venue || !summary) return NextResponse.json({ error: "Venue and the deal are required." }, { status: 400 });
  const price = typeof b.price === "number" ? b.price : (b.price ? Number(String(b.price).replace(/[^0-9.]/g, "")) || null : null);
  const payload = {
    source: "submission", venue, summary,
    neighborhood: clip(b.neighborhood, 80), days: clip(b.days, 80), time: clip(b.time, 80),
    price, role: clip(b.role, 20) || "visitor", email: clip(b.email, 160),
  };
  const p = gp();
  if (!p) return NextResponse.json({ ok: true, queued: false });
  try {
    await p.query("CREATE TABLE IF NOT EXISTS submissions (id SERIAL PRIMARY KEY, venue_guess TEXT, raw_json JSONB, photo_taken_at TIMESTAMPTZ, confidence INTEGER, review_status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now())");
    await p.query("INSERT INTO submissions (venue_guess, raw_json, review_status) VALUES ($1,$2,'pending')", [venue, JSON.stringify(payload)]);
    return NextResponse.json({ ok: true, queued: true });
  } catch { return NextResponse.json({ error: "Could not save right now." }, { status: 500 }); }
}
