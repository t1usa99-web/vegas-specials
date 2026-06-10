import { NextRequest, NextResponse } from "next/server";
import { processPhoto } from "@/lib/extract";
import { SEED } from "@/lib/seedData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Map a venue name the model read to a known venue id (in production: fuzzy DB lookup).
const NAME_TO_ID: Record<string, string> = Object.fromEntries(
  SEED.map((s) => [s.venue.toLowerCase().split(" (")[0], s.venue_id])
);
function resolveVenue(name: string | null): string | null {
  if (!name) return null;
  const key = name.toLowerCase();
  return NAME_TO_ID[key] ?? Object.entries(NAME_TO_ID).find(([n]) => key.includes(n) || n.includes(key))?.[1] ?? null;
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try { body = await req.json(); } catch { /* allow empty */ }

  const imageBase64 = body.mock ? "MOCK" : body.imageBase64;
  if (!imageBase64) {
    return NextResponse.json({ status: "rejected", errors: ["no image provided"] }, { status: 400 });
  }

  const existing = SEED.map((s) => ({ venue_id: s.venue_id, category: s.category, name: s.summary, price: null }));
  existing.push({ venue_id: "v_herbsrye", category: "happy_hour", name: "9oz Filet", price: 15 } as any);

  const result = await processPhoto({
    imageBase64,
    mediaType: body.mediaType ?? "image/jpeg",
    exif: body.exif ?? { hasGps: true, gpsMatchedVenueId: "v_herbsrye", takenAt: new Date(Date.now() - 2 * 3.6e6).toISOString() },
    submitter: body.submitter ?? { handle: "demo_user", reputation: 70 },
    existingSpecials: existing,
    venueResolver: resolveVenue,
  });

  return NextResponse.json(result);
}
