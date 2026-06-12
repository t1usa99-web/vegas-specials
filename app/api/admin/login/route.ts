import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  let b: any = {}; try { b = await req.json(); } catch { /* */ }
  const token = String(b.token || "");
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin", token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 12 });
  return res;
}
