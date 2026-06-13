// Full-menu price scraper. For each venue with a website, finds its menu page,
// extracts every priced item (categorized), and stores them in menu_items.
// Feeds the price index (cheapest X) and "most expensive X" content.
// Run: node db/menus.mjs   Env: MENU_LIMIT, MENU_CONC, MENU_DELAY_MS, MENU_FORCE=1
import pg from "pg";
import { ensureSchema } from "./migrate.mjs";

const FC = process.env.FIRECRAWL_API_KEY;
const ANTHROPIC = process.env.ANTHROPIC_API_KEY;
if (!FC || !ANTHROPIC) { console.error("FIRECRAWL_API_KEY + ANTHROPIC_API_KEY required"); process.exit(1); }
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function firecrawl(url, withLinks = false) {
  try {
    const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST", headers: { Authorization: "Bearer " + FC, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: withLinks ? ["markdown", "links"] : ["markdown"], onlyMainContent: !withLinks, timeout: 25000 }),
    });
    const j = await r.json();
    return j.data || {};
  } catch { return {}; }
}

function findMenuUrl(data, website) {
  const links = (data.links || []).filter((u) => typeof u === "string");
  const cand = links.filter((u) => /menu|food|drink|dining|wine|cocktail|dinner|lunch/i.test(u));
  let host = ""; try { host = new URL(website).host; } catch { /* */ }
  const same = cand.filter((u) => { try { return new URL(u).host === host; } catch { return false; } });
  const arr = same.length ? same : cand;
  return arr.find((u) => /\/menu/i.test(u)) || arr.find((u) => /menu/i.test(u)) || arr[0] || null;
}

const SYS = `Extract menu items with prices from this restaurant/bar menu text. Return ONLY JSON:
{"items":[{"name":string,"price":number,"category":"beer|wine|cocktail|spirit|food|appetizer|entree|steak|seafood|dessert|brunch|other","section":string}]}.
Only include items with a clear numeric price (a single price; for ranges use the lower). Categorize each item. Skip section headers, descriptions, and anything without a price. Cap 120 items. Never invent prices.`;

async function parseMenu(md) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 4000, system: SYS, messages: [{ role: "user", content: "Menu text:\n\n" + md.slice(0, 18000) }] }),
    });
    const j = await r.json();
    const txt = j?.content?.[0]?.text || "{}";
    return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)).items || [];
  } catch { return []; }
}

async function processVenue(v) {
  try {
    const home = await firecrawl(v.website, true);
    let menuUrl = findMenuUrl(home, v.website);
    let md;
    if (menuUrl) { md = (await firecrawl(menuUrl)).markdown || ""; }
    else { md = home.markdown || ""; menuUrl = v.website; }
    if (!md || md.length < 120) { await pool.query("UPDATE venues SET menu_scraped_at=now() WHERE id=$1", [v.id]); return { empty: 1 }; }
    const items = await parseMenu(md);
    const valid = items.filter((it) => it && it.name && typeof it.price === "number" && it.price > 0 && it.price < 5000).slice(0, 150);
    await pool.query("DELETE FROM menu_items WHERE venue_id=$1", [v.id]);
    for (const it of valid) {
      await pool.query(
        "INSERT INTO menu_items (venue_id,name,price,category,section,source_url,last_seen_at) VALUES ($1,$2,$3,$4,$5,$6,now())",
        [v.id, String(it.name).slice(0, 140), it.price, (it.category || "other").toLowerCase().slice(0, 20), (it.section || "").slice(0, 80), menuUrl]);
    }
    await pool.query("UPDATE venues SET menu_scraped_at=now() WHERE id=$1", [v.id]);
    console.log("MENU  ", v.name, "->", valid.length, "items");
    return { parsed: 1, items: valid.length };
  } catch (e) { console.log("FAIL  ", v.name, String(e).slice(0, 50)); return { failed: 1 }; }
}

async function main() {
  await ensureSchema(pool);
  const LIMIT = Number(process.env.MENU_LIMIT || 0);
  const FORCE = process.env.MENU_FORCE === "1";
  const { rows } = await pool.query(
    `SELECT id, name, website FROM venues WHERE website IS NOT NULL AND website <> ''` +
    (FORCE ? "" : " AND menu_scraped_at IS NULL") +
    ` ORDER BY menu_scraped_at ASC NULLS FIRST` + (LIMIT > 0 ? ` LIMIT ${LIMIT}` : ""));
  const CONC = Number(process.env.MENU_CONC || 4);
  const DELAY = Number(process.env.MENU_DELAY_MS || 400);
  console.log(`Menu scrape: ${rows.length} venues with websites · conc=${CONC}`);
  const tot = {};
  for (let i = 0; i < rows.length; i += CONC) {
    const res = await Promise.all(rows.slice(i, i + CONC).map(processVenue));
    for (const r of res) for (const k in r) tot[k] = (tot[k] || 0) + r[k];
    if (DELAY && i + CONC < rows.length) await new Promise((r) => setTimeout(r, DELAY));
  }
  const c = await pool.query("SELECT count(*)::int c FROM menu_items");
  console.log("DONE menus", JSON.stringify(tot), "· total menu_items:", c.rows[0].c);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
