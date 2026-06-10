import Anthropic from "@anthropic-ai/sdk";

export const ENUMS = {
  category: ["food", "drink", "happy_hour", "hotel", "show", "club", "gaming", "pool", "sports", "attraction"],
  discount_type: ["percent_off", "dollar_off", "fixed_price", "bogo", "two_for_one", "free", "comp", "other"],
  day: ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "daily"],
};

export const SYSTEM_PROMPT = `You are a data-extraction engine for a Las Vegas specials directory.
You are given ONE photo — usually a happy-hour menu, a promo sign, a chalkboard, or a flyer.
Extract ONLY what is actually visible into JSON. Do not guess or invent. If not printed, use null/empty.
Rules:
- Output STRICT JSON only. No prose, no markdown.
- If it is not a special (random photo, illegible), set "readable": false, "image_type": "not_a_special".
- Times -> 24h "HH:MM". "3-6pm" -> start "15:00", end "18:00".
- Days -> enum. "Mon-Fri" -> ["mon","tue","wed","thu","fri"]. "Every day" -> ["daily"].
- Prices: numbers only (5.00 not "$5"). "2 for 1"/"50% off" -> price null + correct discount_type.
- Capture EVERY distinct item as its own entry in "items".
- fine_print: restrictions like "Players card required", "Bar only", "21+".
- legibility: honest 0-1 confidence you read it correctly.
JSON shape:
{"readable":bool,"image_type":str,"venue_guess":str|null,"category":str,"days":[str],"start_time":str|null,"end_time":str|null,"valid_until":str|null,"fine_print":[str],"legibility":number,"items":[{"name":str,"price":number|null,"discount_type":str,"is_food":bool,"is_drink":bool,"is_freebie":bool}]}`;

export async function callVision(imageBase64: string, mediaType = "image/jpeg"): Promise<any> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key || imageBase64 === "MOCK") {
    return {
      readable: true, image_type: "happy_hour_menu", venue_guess: "Herbs & Rye",
      category: "happy_hour", days: ["daily"], start_time: "17:00", end_time: "20:00",
      valid_until: null, fine_print: ["Half-off listed items only"], legibility: 0.92,
      items: [
        { name: "9oz Filet", price: 15.0, discount_type: "fixed_price", is_food: true, is_drink: false, is_freebie: false },
        { name: "Linguini & Clams", price: 12.5, discount_type: "fixed_price", is_food: true, is_drink: false, is_freebie: false },
        { name: "All craft cocktails", price: null, discount_type: "percent_off", is_food: false, is_drink: true, is_freebie: false },
      ],
    };
  }
  const client = new Anthropic({ apiKey: key });
  const msg = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{
      role: "user",
      content: [
        { type: "image", source: { type: "base64", media_type: mediaType as any, data: imageBase64 } },
        { type: "text", text: "Extract the specials from this image as strict JSON." },
      ],
    }],
  });
  const text = (msg.content[0] as any)?.text ?? "{}";
  return JSON.parse(text);
}

export function validate(x: any): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (typeof x !== "object" || x === null) return { ok: false, errors: ["not an object"] };
  if (x.readable === false) return { ok: false, errors: ["unreadable / not a special"] };
  if (!Array.isArray(x.items) || x.items.length === 0) errors.push("no items");
  if (x.category && !ENUMS.category.includes(x.category)) errors.push(`bad category: ${x.category}`);
  const timeRe = /^([01]\d|2[0-3]):[0-5]\d$/;
  for (const t of ["start_time", "end_time"]) if (x[t] && !timeRe.test(x[t])) errors.push(`bad ${t}`);
  for (const it of x.items ?? []) {
    if (it.price != null && (typeof it.price !== "number" || it.price < 0 || it.price > 10000)) errors.push("bad price");
  }
  return { ok: errors.length === 0, errors };
}

export function scoreConfidence(x: any, exif: any = {}, submitter: any = {}) {
  let score = 0; const reasons: string[] = [];
  const legib = Math.round((x.legibility ?? 0.5) * 35); score += legib; reasons.push(`legibility +${legib}`);
  if (exif.gpsMatchedVenueId) { score += 25; reasons.push("EXIF GPS matched +25"); }
  else if (exif.hasGps) { score += 10; reasons.push("has GPS +10"); }
  if (exif.takenAt) {
    const ageHrs = (Date.now() - new Date(exif.takenAt).getTime()) / 3.6e6;
    if (ageHrs <= 24) { score += 15; reasons.push("photo <24h +15"); }
    else if (ageHrs <= 168) { score += 8; reasons.push("photo <1wk +8"); }
  }
  const rep = Math.min(20, Math.round((submitter.reputation ?? 0) / 5)); score += rep; reasons.push(`rep +${rep}`);
  if (x.start_time && x.end_time && (x.days ?? []).length) { score += 5; reasons.push("complete +5"); }
  score = Math.max(0, Math.min(100, score));
  const action = score >= 80 ? "auto_publish" : score >= 45 ? "review_queue" : "low_trust_hold";
  return { score, action, reasons };
}

const norm = (s: string) => (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
export function dedupe(venueId: string, category: string, item: any, existing: any[]) {
  const key = [venueId, category, norm(item.name)].join("|");
  const match = existing.find((e) => [e.venue_id, e.category, norm(e.name)].join("|") === key);
  if (match) {
    const close = match.price != null && item.price != null ? Math.abs(match.price - item.price) <= 1 : true;
    if (close) return { action: "merge", match };
  }
  return { action: "insert", match: null };
}

export async function processPhoto(opts: {
  imageBase64: string; mediaType?: string; exif?: any; submitter?: any;
  existingSpecials?: any[]; venueResolver?: (name: string | null) => string | null;
}) {
  const { imageBase64, mediaType = "image/jpeg", exif = {}, submitter = {}, existingSpecials = [], venueResolver } = opts;
  const extraction = await callVision(imageBase64, mediaType);
  const v = validate(extraction);
  if (!v.ok) return { status: "rejected", errors: v.errors, extraction };
  const venueId = exif.gpsMatchedVenueId ?? (venueResolver ? venueResolver(extraction.venue_guess) : null) ?? "UNRESOLVED";
  const conf = scoreConfidence(extraction, exif, submitter);
  const rows = extraction.items.map((item: any) => {
    const dd = dedupe(venueId, extraction.category, item, existingSpecials);
    return {
      venue_id: venueId, category: extraction.category, name: item.name, price: item.price,
      discount_type: item.discount_type, is_food: item.is_food, is_drink: item.is_drink, is_freebie: item.is_freebie,
      days: extraction.days, start_time: extraction.start_time, end_time: extraction.end_time,
      fine_print: extraction.fine_print, source: submitter.handle ? "user_photo" : "social_photo",
      confidence: conf.score, status: conf.action === "auto_publish" ? "live" : "unverified",
      last_verified_at: exif.takenAt ?? new Date().toISOString(), _dedupe: dd.action,
    };
  });
  return { status: "ok", venueId, confidence: conf, rows };
}
