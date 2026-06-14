import pg from "pg";
import crypto from "node:crypto";
import { ensureSchema, BACKFILL } from "./migrate.mjs";

const FC = process.env.FIRECRAWL_API_KEY;
const ANTHROPIC = process.env.ANTHROPIC_API_KEY;
if (!FC) { console.error("FIRECRAWL_API_KEY required"); process.exit(1); }
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

function clean(md) {
  return (md || "").split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("![") && !/^\[[^\]]*\]\([^)]*\)$/.test(l) && !/cookie|privacy policy|^\[.*close/i.test(l))
    .join("\n");
}
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

async function firecrawl(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST", headers: { Authorization: "Bearer " + FC, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true, timeout: 14000 }),
      signal: ctrl.signal,
    });
    const j = await r.json();
    return j?.data?.markdown || "";
  } finally { clearTimeout(timer); }
}

const TODAY = new Date().toISOString().slice(0,10);
const FORCE_REPARSE = process.env.FORCE_REPARSE === "1";
const SYS = `You extract Las Vegas venue info + deals from scraped promo/menu text into strict JSON.
Return ONLY a single JSON object: {"cuisine":string,"vibe_tags":[string],"description":string,"specials":[...]}.
"cuisine" = the venue's primary cuisine if it's a restaurant (e.g. "Sushi","Steakhouse","Mexican","Italian","French","Thai","American","Seafood","Japanese"), else "".
"description" = a neutral, factual 1-2 sentence summary of what this venue is — type, setting/vibe, and signature offering. <=240 chars. No marketing fluff, no exclamation points. e.g. "A retro tiki bar off the Strip known for frozen cocktails and a Polynesian-themed patio." Leave "" if the page does not say.
"vibe_tags" = any that clearly apply, choose from: rooftop, patio, dive bar, upscale, speakeasy, lounge, sports bar, date night, hidden gem, view, dog-friendly, gaming, pool, live music, late night, lgbtq, cocktail bar, wine bar, beer bar, brewery, tiki bar, whiskey bar, tequila bar, piano bar, karaoke, irish pub, gastropub, hookah lounge, cigar lounge, country bar, comedy, 24-hour.
"specials" = an array with ONE item per DISTINCT deal (never merge different times/types/outlets). Each item:
{"category":"happy_hour|food|drink|gaming|pool|club|show|hotel","summary":string(<=110),"food":bool,"drink":bool,"freebie":bool,"days":string,"start_time":string,"end_time":string,"reverse_window":string,"price":number|null,"discount_type":"percent_off|dollar_off|fixed_price|bogo|two_for_one|free|comp|other","outlet":string,"items":[{"name":string,"price":number|null}],"valid_until":string,"fine_print":string}.
"price" = the headline price for the deal as a number when the page states one ("$5 wells"->5). If no single price but items are listed with prices, use the lowest. For free/complimentary deals set "freebie":true. Set "discount_type" accurately (percent_off for "50% off", two_for_one/bogo for 2-for-1, free/comp for freebies).
"items" = the individual happy-hour menu items with their prices if listed (e.g. [{"name":"Wells","price":5},{"name":"Deviled eggs","price":5}]), else [].
"valid_until" = the ISO date (YYYY-MM-DD) the deal EXPIRES (last day it applies), else "". Today is ${TODAY}. ALWAYS set it for any deal tied to a date, holiday, event, season, or limited run. Resolve named holidays/events to their real calendar date in the year the deal refers to (default the current year): "Cinco de Mayo"->YYYY-05-05, "4th of July"/"Independence Day"->YYYY-07-04, "Veterans Day"->YYYY-11-11, "Memorial Day"/"Labor Day"->that holiday's date that year, "summer"/"through Labor Day"->early September, "June 5-7"->YYYY-06-07, a pool deal ending in fall->end of September. For ongoing/recurring deals (Taco Tuesday, daily happy hour, reverse happy hour, weekly nights) leave "" — they do not expire.
For an always-available item set days="Daily", start_time="All day", end_time="All day". Mark all-day ONLY when the DEAL is, not because the venue is open 24/7. Pool / dayclub deals use category "pool". Skip generic marketing. If no real deals, still return cuisine/vibe with "specials":[].`;

async function parse(md) {
  if (!ANTHROPIC) return null;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 2000, system: SYS,
      messages: [{ role: "user", content: "Extract deals from this page:\n\n" + md.slice(0, 12000) }] }),
  });
  const j = await r.json();
  const txt = j?.content?.[0]?.text || "{}";
  try { return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)); } catch { return {}; }
}

async function processOne(t) {
  try {
    const md = clean(await firecrawl(t.url));
    if (!md || md.length < 50) { await pool.query("UPDATE scrape_targets SET last_status='empty', last_scraped_at=now() WHERE id=$1", [t.id]); return {empty:1}; }
    const h = sha(md);
    if (h === t.last_hash && !FORCE_REPARSE) { await pool.query("UPDATE scrape_targets SET last_scraped_at=now(), last_status='unchanged' WHERE id=$1", [t.id]); return {unchanged:1}; }
    if (ANTHROPIC) {
      const parsed = (await parse(md)) || {};
      const specials = parsed.specials || [];
      if (parsed.cuisine || parsed.description || (parsed.vibe_tags && parsed.vibe_tags.length)) {
        await pool.query("UPDATE venues SET cuisine=COALESCE(NULLIF($2,''),cuisine), vibe_tags=COALESCE($3,vibe_tags), description=COALESCE(NULLIF($4,''),description) WHERE id=$1",
          [t.venue_id, parsed.cuisine||'', (parsed.vibe_tags && parsed.vibe_tags.length)?JSON.stringify(parsed.vibe_tags):null, (parsed.description||'').slice(0,300)]);
      }
      await pool.query("DELETE FROM specials WHERE venue_id=$1 AND source='firecrawl'", [t.venue_id]);
      let ins=0;
      for (const s of specials) {
        await pool.query(`INSERT INTO specials (venue_id,category,summary,food,drink,freebie,days,start_time,end_time,reverse_window,price,discount_type,outlet,source_url,fine_print,items,valid_until,source,confidence,status,last_seen_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'firecrawl',66,'live',now())`,
          [t.venue_id, s.category||'happy_hour', (s.summary||'').slice(0,140), !!s.food, !!s.drink, !!s.freebie, s.days||'', s.start_time||'', s.end_time||'', s.reverse_window||'', (typeof s.price==='number'?s.price:null), s.discount_type||'other', s.outlet||'', t.url, s.fine_print||'', JSON.stringify(s.items||[]), (s.valid_until||null)]);
        ins++;
      }
      await pool.query("UPDATE scrape_targets SET last_hash=$2, last_scraped_at=now(), last_status='parsed' WHERE id=$1", [t.id, h]);
      console.log("PARSED ", t.url, "->", specials.length, "deals");
      return {parsed:1, ins};
    } else {
      await pool.query("UPDATE scrape_targets SET last_hash=$2, last_scraped_at=now(), last_status='parse_pending' WHERE id=$1", [t.id, h]);
      return {pending:1};
    }
  } catch (e) { console.log("FAIL   ", t.url, String(e).slice(0,60)); return {failed:1}; }
}

async function main() {
  await ensureSchema(pool);
  for (const sql of BACKFILL) await pool.query(sql);
  const LIMIT = parseInt(process.env.SCRAPE_LIMIT || "0", 10);
  const { rows: targets } = await pool.query(
    "SELECT * FROM scrape_targets WHERE active ORDER BY last_scraped_at ASC NULLS FIRST" + (LIMIT > 0 ? ` LIMIT ${LIMIT}` : ""));
  const CONC = parseInt(process.env.SCRAPE_CONC || "6", 10);
  const DELAY = parseInt(process.env.SCRAPE_DELAY_MS || "0", 10);
  console.log(`Scraping ${targets.length} target(s) · conc=${CONC} · delay=${DELAY}ms`);
  const tot = {};
  for (let i = 0; i < targets.length; i += CONC) {
    const batch = targets.slice(i, i + CONC);
    const res = await Promise.all(batch.map(processOne));
    for (const r of res) for (const k in r) tot[k] = (tot[k]||0) + r[k];
    if (DELAY && i + CONC < targets.length) await new Promise((r) => setTimeout(r, DELAY));
  }
  console.log("\nDONE", JSON.stringify(tot));
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
