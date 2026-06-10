import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | null = null;
function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  return pool;
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch {}
  const email = (body.email || "").trim().toLowerCase();
  if (!email || !email.includes("@")) return NextResponse.json({ ok: false, error: "invalid email" }, { status: 400 });

  const p = getPool();
  if (p) { try { await p.query("INSERT INTO subscribers(email,source) VALUES($1,$2) ON CONFLICT(email) DO NOTHING", [email, body.source || "site"]); } catch {} }

  const key = process.env.BEEHIIV_API_KEY, pub = process.env.BEEHIIV_PUB_ID;
  if (key && pub) {
    try {
      await fetch(`https://api.beehiiv.com/v2/publications/${pub}/subscriptions`, {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({ email, reactivate_existing: true, send_welcome_email: true, utm_source: body.source || "site" }),
      });
    } catch {}
  }
  return NextResponse.json({ ok: true });
}
