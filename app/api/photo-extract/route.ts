import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

const SYS = `You read photos of Las Vegas menus, happy-hour boards, and promo signs. Return ONLY JSON:
{"venue":string,"specials":[{"summary":string,"price":number|null,"days":string,"time":string,"items":[{"name":string,"price":number|null}]}]}.
Extract every deal, price, and time you can clearly read. "venue" only if visible. If it is not a menu/deal photo, return {"venue":"","specials":[]}. Never invent prices.`;

export async function POST(req: NextRequest) {
  let b: any = {}; try { b = await req.json(); } catch { /* empty */ }
  const img = b.imageBase64;
  const mediaType = ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(b.mediaType) ? b.mediaType : "image/jpeg";
  if (!img || typeof img !== "string") return NextResponse.json({ error: "No image provided." }, { status: 400 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "Photo reading is temporarily unavailable." }, { status: 503 });
  const data = img.includes(",") ? img.split(",")[1] : img;
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001", max_tokens: 1500, system: SYS,
        messages: [{ role: "user", content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data } },
          { type: "text", text: "Read the deals and prices from this photo." },
        ] }],
      }),
    });
    const j = await r.json();
    const txt = j?.content?.[0]?.text || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)); } catch { /* */ }
    const specials = Array.isArray(parsed.specials) ? parsed.specials.slice(0, 25) : [];
    const venue = (parsed.venue || b.venue || "").toString().slice(0, 160);
    const p = gp();
    if (p && specials.length) {
      try {
        await p.query("CREATE TABLE IF NOT EXISTS submissions (id SERIAL PRIMARY KEY, venue_guess TEXT, raw_json JSONB, photo_taken_at TIMESTAMPTZ, confidence INTEGER, review_status TEXT DEFAULT 'pending', created_at TIMESTAMPTZ DEFAULT now())");
        await p.query("INSERT INTO submissions (venue_guess, raw_json, review_status) VALUES ($1,$2,'pending')",
          [venue, JSON.stringify({ source: "user_photo", venue, specials })]);
      } catch { /* */ }
    }
    return NextResponse.json({ ok: true, venue, specials });
  } catch { return NextResponse.json({ error: "Couldn't read that photo. Try a clearer shot." }, { status: 500 }); }
}
