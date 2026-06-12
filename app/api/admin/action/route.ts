import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }
function authed(req: NextRequest) { return !!process.env.ADMIN_TOKEN && req.cookies.get("admin")?.value === process.env.ADMIN_TOKEN; }
const num = (v: any) => (typeof v === "number" ? v : v ? Number(String(v).replace(/[^0-9.]/g, "")) || null : null);

async function resolveVenue(p: Pool, name: string, hood: string) {
  if (!name) return null;
  const f = await p.query("SELECT id FROM venues WHERE name ILIKE $1 LIMIT 1", [name]);
  if (f.rows[0]) return f.rows[0].id;
  const id = "sub_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  await p.query("INSERT INTO venues (id,name,type,neighborhood) VALUES ($1,$2,$3,$4) ON CONFLICT (id) DO NOTHING", [id, name.slice(0, 160), "Submitted", (hood || "").slice(0, 80)]);
  return id;
}

export async function POST(req: NextRequest) {
  if (!authed(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  let b: any = {}; try { b = await req.json(); } catch { /* */ }
  const id = Number(b.id); const action = b.action;
  const p = gp(); if (!p) return NextResponse.json({ error: "no db" }, { status: 500 });
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  try {
    if (action === "reject") { await p.query("UPDATE submissions SET review_status='rejected' WHERE id=$1", [id]); return NextResponse.json({ ok: true }); }
    if (action === "special_remove") { await p.query("UPDATE specials SET status='expired' WHERE id=$1", [id]); return NextResponse.json({ ok: true }); }
    if (action === "special_keep") { await p.query("UPDATE specials SET status='live', flagged_count=0 WHERE id=$1", [id]); return NextResponse.json({ ok: true }); }
    if (action === "approve") {
      const { rows: [sub] } = await p.query("SELECT * FROM submissions WHERE id=$1", [id]);
      if (!sub) return NextResponse.json({ error: "not found" }, { status: 404 });
      const raw = sub.raw_json || {};
      const vid = await resolveVenue(p, raw.venue || sub.venue_guess || "", raw.neighborhood || "");
      if (!vid) return NextResponse.json({ error: "no venue name" }, { status: 400 });
      const items = raw.source === "user_photo" ? (raw.specials || []) : [{ summary: raw.summary, price: raw.price, days: raw.days, time: raw.time, items: [] }];
      const src = raw.source === "user_photo" ? "user_photo" : "submission";
      let ins = 0;
      for (const it of items) {
        if (!it || !it.summary) continue;
        await p.query(
          `INSERT INTO specials (venue_id,category,summary,food,drink,freebie,days,start_time,end_time,price,outlet,fine_print,items,source,confidence,status,verified_count,last_verified_at,last_seen_at)
           VALUES ($1,'happy_hour',$2,false,false,false,$3,$4,'',$5,'','',$6,$7,78,'live',1,now(),now())`,
          [vid, String(it.summary).slice(0, 140), it.days || "", it.time || "", num(it.price), JSON.stringify(it.items || []), src]);
        ins++;
      }
      await p.query("UPDATE submissions SET review_status='approved' WHERE id=$1", [id]);
      return NextResponse.json({ ok: true, inserted: ins });
    }
    return NextResponse.json({ error: "bad action" }, { status: 400 });
  } catch { return NextResponse.json({ error: "failed" }, { status: 500 }); }
}
