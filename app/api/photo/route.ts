import { NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!ref || !key) return new Response("missing", { status: 404 });
  try {
    const r = await fetch(`https://places.googleapis.com/v1/${ref}/media?maxHeightPx=500&maxWidthPx=900&key=${key}`);
    if (!r.ok) return new Response("not found", { status: 404 });
    const buf = await r.arrayBuffer();
    return new Response(buf, { headers: { "Content-Type": r.headers.get("content-type") || "image/jpeg", "Cache-Control": "public, max-age=604800" } });
  } catch { return new Response("err", { status: 500 }); }
}
