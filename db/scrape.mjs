import pg from "pg";
import crypto from "node:crypto";

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
  const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST", headers: { Authorization: "Bearer " + FC, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
  });
  const j = await r.json();
  return j?.data?.markdown || "";
}

const SYS = `You extract Las Vegas venue deals from scraped promo-page text into strict JSON.
Return ONLY a JSON array. Each item: {"category":"happy_hour|food|drink|gaming|hotel","summary":string (<=140 chars),"food":bool,"drink":bool,"freebie":bool,"days":string,"start_time":string,"end_time":string,"reverse_window":string,"price":number|null,"discount_type":"percent_off|dollar_off|fixed_price|bogo|two_for_one|free|comp|other","outlet":string,"fine_print":string}.
"price" = lowest representative dollar amount as a number (5 for "$5 wells"), or null for %/BOGO/varies. "outlet" = the specific bar/restaurant inside the venue if named (e.g. "The Front Yard"), else "". "reverse_window" = a second/late-night window if mentioned (e.g. "10pm-1am"), else "". Mark a special all-day ONLY if the DEAL itself says so, not because the venue is open 24/7.
Only include real, specific deals (prices, times, free items, comps). Skip generic marketing. If none, return [].`;

async function parse(md) {
  if (!ANTHROPIC) return null;
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 1500, system: SYS,
      messages: [{ role: "user", content: "Extract deals from this page:\n\n" + md.slice(0, 12000) }] }),
  });
  const j = await r.json();
  const txt = j?.content?.[0]?.text || "[]";
  try { return JSON.parse(txt.slice(txt.indexOf("["), txt.lastIndexOf("]") + 1)); } catch { return []; }
}

async function processOne(t) {
  try {
    const md = clean(await firecrawl(t.url));
    if (!md || md.length < 50) { await pool.query("UPDATE scrape_targets SET last_status='empty', last_scraped_at=now() WHERE id=$1", [t.id]); return {empty:1}; }
    const h = sha(md);
    if (h === t.last_hash) { await pool.query("UPDATE scrape_targets SET last_scraped_at=now(), last_status='unchanged' WHERE id=$1", [t.id]); return {unchanged:1}; }
    if (ANTHROPIC) {
      const specials = (await parse(md)) || [];
      await pool.query("DELETE FROM specials WHERE venue_id=$1 AND source='firecrawl'", [t.venue_id]);
      let ins=0;
      for (const s of specials) {
        await pool.query(`INSERT INTO specials (venue_id,category,summary,food,drink,freebie,days,start_time,end_time,reverse_window,price,discount_type,outlet,source_url,fine_print,source,confidence,status,last_verified_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'firecrawl',66,'live',now())`,
          [t.venue_id, s.category||'happy_hour', (s.summary||'').slice(0,140), !!s.food, !!s.drink, !!s.freebie, s.days||'', s.start_time||'', s.end_time||'', s.reverse_window||'', (typeof s.price==='number'?s.price:null), s.discount_type||'other', s.outlet||'', t.url, s.fine_print||'']);
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
  const { rows: targets } = await pool.query("SELECT * FROM scrape_targets WHERE active ORDER BY last_scraped_at ASC NULLS FIRST");
  const CONC = 6;
  const tot = {};
  for (let i = 0; i < targets.length; i += CONC) {
    const batch = targets.slice(i, i + CONC);
    const res = await Promise.all(batch.map(processOne));
    for (const r of res) for (const k in r) tot[k] = (tot[k]||0) + r[k];
  }
  console.log("\nDONE", JSON.stringify(tot));
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
