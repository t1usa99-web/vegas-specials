import { Pool } from "pg";
let pool: Pool | null = null;
function gp() { if (!process.env.DATABASE_URL) return null; if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }); return pool; }

const DAYI: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function parseDays(s: string): Set<number> | null {
  if (!s) return null;
  const t = s.toLowerCase();
  if (t.includes("daily") || t.includes("every")) return new Set([0, 1, 2, 3, 4, 5, 6]);
  if (t.includes("weekend")) return new Set([0, 6]);
  if (t.includes("tbd")) return null;
  const parts = t.split(/[–-]/).map((x) => x.trim().slice(0, 3)).filter((x) => x in DAYI);
  if (parts.length === 1) return new Set([DAYI[parts[0]]]);
  if (parts.length >= 2) {
    const a = DAYI[parts[0]], b = DAYI[parts[parts.length - 1]];
    const set = new Set<number>(); let i = a;
    for (let n = 0; n < 7; n++) { set.add(i); if (i === b) break; i = (i + 1) % 7; }
    return set;
  }
  return null;
}
function parseTime(s: string): number | "always" | null {
  if (!s) return null;
  const t = s.toLowerCase();
  if (t.includes("all day") || t.includes("24/7") || t.includes("24 ")) return "always";
  if (t.includes("tbd")) return null;
  const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (!m) return null;
  let h = parseInt(m[1]); const min = m[2] ? parseInt(m[2]) : 0;
  if (m[3] === "pm" && h !== 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  return h * 60 + min;
}
export function vegasNow() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
}
// true = open, false = closed, null = can't tell
export function isOpenNow(s: { days: string; start_time: string; end_time: string }, now = vegasNow()): boolean | null {
  const start = parseTime(s.start_time);
  if (start === "always") {
    const days = parseDays(s.days);
    if (!days) return true;
    return days.has(now.day);
  }
  const days = parseDays(s.days);
  const end = parseTime(s.end_time);
  if (!days || start === null || end === null || typeof start !== "number" || typeof end !== "number") return null;
  if (!days.has(now.day)) return false;
  return end <= start ? (now.min >= start || now.min < end) : (now.min >= start && now.min < end);
}

// Returns venues (grouped) that have at least one special open right now.
export async function openNowVenues(): Promise<any[]> {
  const p = gp(); if (!p) return [];
  let rows: any[] = [];
  try {
    const r = await p.query(`
      SELECT s.id, s.summary, s.price, s.days, s.start_time, s.end_time, s.outlet, s.category, s.confidence,
             v.id AS vid, v.name, v.neighborhood, v.rating, v.photo_ref
      FROM specials s JOIN venues v ON v.id = s.venue_id
      WHERE s.status='live' AND (s.valid_until IS NULL OR s.valid_until >= CURRENT_DATE) AND s.category IN ('happy_hour','drink','food','gaming')`);
    rows = r.rows;
  } catch { return []; }
  const now = vegasNow();
  const open = rows.filter((s) => isOpenNow(s, now) === true);
  const byVenue = new Map<string, any>();
  for (const s of open) {
    if (!byVenue.has(s.vid)) byVenue.set(s.vid, { id: s.vid, name: s.name, neighborhood: s.neighborhood, rating: s.rating, photo_ref: s.photo_ref, specials: [], cheapest: null });
    const g = byVenue.get(s.vid);
    g.specials.push({ summary: s.summary, price: s.price, days: s.days, start: s.start_time, end: s.end_time, outlet: s.outlet });
    if (s.price != null && (g.cheapest == null || s.price < g.cheapest)) g.cheapest = s.price;
  }
  return Array.from(byVenue.values()).sort((a, b) => (b.rating || 0) - (a.rating || 0));
}
