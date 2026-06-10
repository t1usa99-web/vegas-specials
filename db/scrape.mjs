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
Return ONLY a JSON array. Each item: {"category":"happy_hour|food|drink|gaming|hotel","summary":string (<=140 chars),"food":bool,"drink":bool,"freebie":bool,"days":string,"start_time":string,"end_time":string,"fine_print":string}.
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

async function main() {
  const { rows: targets } = await pool.query("SELECT * FROM scrape_targets WHERE active");
  let changed = 0, unchanged = 0, failed = 0, inserted = 0, pending = 0;
  for (const t of targets) {
    try {
      const md = clean(await firecrawl(t.url));
      if (!md || md.length < 50) { failed++; await pool.query("UPDATE scrape_targets SET last_status='empty', last_scraped_at=now() WHERE id=$1", [t.id]); console.log("EMPTY  ", t.url); continue; }
      const h = sha(md);
      if (h === t.last_hash) { unchanged++; await pool.query("UPDATE scrape_targets SET last_scraped_at=now(), last_status='unchanged' WHERE id=$1", [t.id]); console.log("SAME   ", t.url); continue; }
      changed++;
      if (ANTHROPIC) {
        const specials = (await parse(md)) || [];
        await pool.query("DELETE FROM specials WHERE venue_id=$1 AND source='firecrawl'", [t.venue_id]);
        for (const s of specials) {
          await pool.query(`INSERT INTO specials (venue_id,category,summary,food,drink,freebie,days,start_time,end_time,fine_print,source,confidence,status,last_verified_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'firecrawl',66,'live',now())`,
            [t.venue_id, s.category||'happy_hour', (s.summary||'').slice(0,140), !!s.food, !!s.drink, !!s.freebie, s.days||'', s.start_time||'', s.end_time||'', s.fine_print||'']);
          inserted++;
        }
        await pool.query("UPDATE scrape_targets SET last_hash=$2, last_scraped_at=now(), last_status='parsed' WHERE id=$1", [t.id, h]);
        console.log("PARSED ", t.url, "->", specials.length, "deals");
      } else {
        pending++;
        await pool.query("UPDATE scrape_targets SET last_hash=$2, last_scraped_at=now(), last_status='parse_pending' WHERE id=$1", [t.id, h]);
        console.log("CHANGED", t.url, "(parse pending — no ANTHROPIC_API_KEY)");
      }
    } catch (e) { failed++; console.log("FAIL   ", t.url, String(e).slice(0,80)); }
    await new Promise((r) => setTimeout(r, 800)); // politeness
  }
  console.log(`\nDONE  changed=${changed} unchanged=${unchanged} failed=${failed} parsePending=${pending} specialsInserted=${inserted}`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
