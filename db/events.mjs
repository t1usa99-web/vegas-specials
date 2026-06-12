// Ingest Las Vegas events from Ticketmaster Discovery + SeatGeek (both free, key-gated).
// Each adapter skips gracefully if its key is absent. Run: node db/events.mjs
import pg from "pg";
import { ensureSchema } from "./migrate.mjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PAGES = Number(process.env.EVENTS_PAGES || 5);

function mapTmSegment(seg) {
  const s = (seg || "").toLowerCase();
  if (s.includes("music")) return "concert";
  if (s.includes("sport")) return "sports";
  if (s.includes("arts") || s.includes("theatre") || s.includes("theater") || s.includes("film")) return "show";
  if (s.includes("comedy")) return "comedy";
  return "other";
}
function mapSgType(t) {
  const s = (t || "").toLowerCase();
  if (s === "concert" || s.includes("music")) return "concert";
  if (s.includes("comedy")) return "comedy";
  if (s.includes("theater") || s.includes("broadway") || s.includes("cirque") || s.includes("show")) return "show";
  if (["nba","nfl","mlb","nhl","mls","ncaa","sports","fight","mma","boxing","ufc"].some(k => s.includes(k))) return "sports";
  return "other";
}

async function upsert(e) {
  if (!e.name || !e.starts) return false;
  await pool.query(
    `INSERT INTO events (id,source,name,category,venue_name,starts_at,url,image_url,price_min,price_max,lat,lng,status,last_seen_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'live',now())
     ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, venue_name=EXCLUDED.venue_name,
       starts_at=EXCLUDED.starts_at, url=EXCLUDED.url, image_url=EXCLUDED.image_url,
       price_min=EXCLUDED.price_min, price_max=EXCLUDED.price_max, lat=EXCLUDED.lat, lng=EXCLUDED.lng, last_seen_at=now()`,
    [e.id, e.source, e.name.slice(0, 200), e.category, (e.venue_name || "").slice(0, 160), e.starts,
     e.url || "", e.image_url || null, e.price_min ?? null, e.price_max ?? null, e.lat ?? null, e.lng ?? null]);
  return true;
}

async function ticketmaster() {
  const KEY = process.env.TICKETMASTER_API_KEY;
  if (!KEY) { console.log("skip ticketmaster (no TICKETMASTER_API_KEY)"); return 0; }
  let n = 0;
  for (let page = 0; page < PAGES; page++) {
    const url = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${KEY}&city=Las%20Vegas&stateCode=NV&countryCode=US&size=199&page=${page}&sort=date,asc`;
    const r = await fetch(url);
    if (!r.ok) { console.log("ticketmaster http", r.status); break; }
    const data = await r.json();
    const events = data._embedded?.events || [];
    if (!events.length) break;
    for (const e of events) {
      const v = e._embedded?.venues?.[0];
      const starts = e.dates?.start?.dateTime || (e.dates?.start?.localDate ? e.dates.start.localDate + "T19:00:00Z" : null);
      const pr = e.priceRanges?.[0];
      const img = (e.images || []).slice().sort((a, b) => (b.width || 0) - (a.width || 0))[0]?.url || null;
      if (await upsert({
        id: "tm_" + e.id, source: "ticketmaster", name: e.name,
        category: mapTmSegment(e.classifications?.[0]?.segment?.name),
        venue_name: v?.name || "", starts, url: e.url, image_url: img,
        price_min: pr?.min ?? null, price_max: pr?.max ?? null,
        lat: v?.location?.latitude ? Number(v.location.latitude) : null,
        lng: v?.location?.longitude ? Number(v.location.longitude) : null,
      })) n++;
    }
    const totalPages = data.page?.totalPages ?? 1;
    if (page + 1 >= totalPages) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log("ticketmaster:", n, "events");
  return n;
}

async function seatgeek() {
  const ID = process.env.SEATGEEK_CLIENT_ID;
  if (!ID) { console.log("skip seatgeek (no SEATGEEK_CLIENT_ID)"); return 0; }
  let n = 0;
  const nowIso = new Date().toISOString();
  for (let page = 1; page <= PAGES; page++) {
    const url = `https://api.seatgeek.com/2/events?client_id=${ID}&venue.city=Las+Vegas&per_page=100&page=${page}&sort=datetime_local.asc&datetime_utc.gte=${encodeURIComponent(nowIso)}`;
    const r = await fetch(url);
    if (!r.ok) { console.log("seatgeek http", r.status); break; }
    const data = await r.json();
    const events = data.events || [];
    if (!events.length) break;
    for (const e of events) {
      let starts = e.datetime_utc || e.datetime_local || null;
      if (starts && !/[zZ]|[+-]\d\d:?\d\d$/.test(starts)) starts = starts.replace(" ", "T") + "Z";
      if (await upsert({
        id: "sg_" + e.id, source: "seatgeek", name: e.title || e.short_title || "",
        category: mapSgType(e.type), venue_name: e.venue?.name || "", starts, url: e.url,
        image_url: e.performers?.[0]?.image || null,
        price_min: e.stats?.lowest_price ?? null, price_max: e.stats?.highest_price ?? null,
        lat: e.venue?.location?.lat ?? null, lng: e.venue?.location?.lon ?? null,
      })) n++;
    }
  }
  console.log("seatgeek:", n, "events");
  return n;
}

async function main() {
  await ensureSchema(pool);
  const a = await ticketmaster();
  const b = await seatgeek();
  // Drop events that have already passed, so the table stays clean.
  const del = await pool.query("DELETE FROM events WHERE starts_at < now() - interval '1 day'");
  const tot = await pool.query("SELECT count(*)::int c FROM events WHERE starts_at >= now()");
  console.log(`DONE events: +${a + b} upserted, ${del.rowCount} expired removed, ${tot.rows[0].c} upcoming in DB`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
