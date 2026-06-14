// Full-menu price scraper with VISION fallback.
// For each venue: find menu page -> extract priced items from TEXT. If the text
// menu is sparse (image/PDF menu), grab the menu's images + PDFs and run Claude
// vision on them (same pipeline as app/api/photo-extract). Merge + dedupe.
// Run: node db/menus.mjs
// Env: MENU_LIMIT, MENU_CONC, MENU_DELAY_MS, MENU_FORCE=1, MENU_NAME=substr,
//      VISION_IF_TEXT_UNDER (default 8), IMG_PER_VENUE (default 2),
//      PDF_PER_VENUE (default 1), VISION_OFF=1
import pg from "pg";
import { ensureSchema } from "./migrate.mjs";

const FC = process.env.FIRECRAWL_API_KEY;
const ANTHROPIC = process.env.ANTHROPIC_API_KEY;
if (!FC || !ANTHROPIC) { console.error("FIRECRAWL_API_KEY + ANTHROPIC_API_KEY required"); process.exit(1); }
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const VISION_OFF = process.env.VISION_OFF === "1";
const VTHRESH = Number(process.env.VISION_IF_TEXT_UNDER || 8);
const IMG_PER_VENUE = Number(process.env.IMG_PER_VENUE || 2);
const PDF_PER_VENUE = Number(process.env.PDF_PER_VENUE || 1);

async function firecrawl(url, withLinks = false) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST", headers: { Authorization: "Bearer " + FC, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: withLinks ? ["markdown", "links"] : ["markdown"], onlyMainContent: !withLinks, timeout: 12000 }),
      signal: ctrl.signal,
    });
    const j = await r.json();
    return withLinks ? (j?.data || {}) : (j?.data?.markdown || "");
  } catch { return withLinks ? {} : ""; }
  finally { clearTimeout(timer); }
}

function findMenuUrl(data, website) {
  const links = (data.links || []).filter((u) => typeof u === "string");
  const cand = links.filter((u) => /menu|food|drink|dining|wine|cocktail|dinner|lunch/i.test(u));
  let host = ""; try { host = new URL(website).host; } catch { /* */ }
  const same = cand.filter((u) => { try { return new URL(u).host === host; } catch { return false; } });
  const arr = same.length ? same : cand;
  return arr.find((u) => /\/menu/i.test(u)) || arr.find((u) => /menu/i.test(u)) || arr[0] || null;
}

const BAD_IMG = /logo|icon|favicon|sprite|avatar|header|footer|background|\bbg[-_.]|banner|map[-_.]|google|facebook|instagram|twitter|yelp|tripadvisor|pixel|spacer|placeholder|thumb|loading|opentable|resy/i;
function abs(u, base) { try { return new URL(u, base).href; } catch { return null; } }
function mediaFromUrl(u) {
  if (/\.png(\?|$)/i.test(u)) return "image/png";
  if (/\.webp(\?|$)/i.test(u)) return "image/webp";
  if (/\.gif(\?|$)/i.test(u)) return "image/gif";
  return "image/jpeg";
}
function collectAssets(md, links, base) {
  const imgs = new Set(), pdfs = new Set();
  const re = /!\[[^\]]*\]\(([^)\s]+)\)/g; let m;
  while ((m = re.exec(md || ""))) {
    const u = abs(m[1], base);
    if (u && /\.(jpe?g|png|webp)(\?|$)/i.test(u) && !BAD_IMG.test(u)) imgs.add(u);
  }
  for (const l of links || []) {
    if (typeof l !== "string") continue;
    const u = abs(l, base); if (!u) continue;
    if (/\.pdf(\?|$)/i.test(u)) pdfs.add(u);
    else if (/\.(jpe?g|png|webp)(\?|$)/i.test(u) && !BAD_IMG.test(u)) imgs.add(u);
  }
  return { images: [...imgs], pdfs: [...pdfs] };
}

async function fetchB64(url, maxBytes = 4500000, minBytes = 9000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 13000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    if (!r.ok) return null;
    const ab = await r.arrayBuffer();
    if (ab.byteLength < minBytes || ab.byteLength > maxBytes) return null;
    return Buffer.from(ab).toString("base64");
  } catch { return null; }
  finally { clearTimeout(timer); }
}

const SYS = `Extract menu items with prices from this restaurant/bar menu (text, photo, or PDF). Return ONLY JSON:
{"items":[{"name":string,"price":number,"category":"beer|wine|cocktail|spirit|food|appetizer|entree|steak|seafood|dessert|brunch|other","section":string}]}.
Only include items with a clear numeric price (a single price; for ranges use the lower). Categorize each item. Skip section headers, descriptions, and anything without a price. Cap 120 items. Never invent prices.`;

async function callClaude(content) {
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST", headers: { "x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json" },
      body: JSON.stringify({ model: "claude-haiku-4-5-20251001", max_tokens: 4000, system: SYS, messages: [{ role: "user", content }] }),
    });
    const j = await r.json();
    const txt = j?.content?.[0]?.text || "{}";
    return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)).items || [];
  } catch { return []; }
}

const parseMenuText = (md) => callClaude("Menu text:\n\n" + md.slice(0, 18000));
const visionImage = (b64, mediaType) => callClaude([
  { type: "image", source: { type: "base64", media_type: mediaType, data: b64 } },
  { type: "text", text: "Extract every priced item from this menu image." },
]);
const visionPdf = (b64) => callClaude([
  { type: "document", source: { type: "base64", media_type: "application/pdf", data: b64 } },
  { type: "text", text: "Extract every priced item from this menu PDF." },
]);

async function processVenue(v) {
  try {
    const home = await firecrawl(v.website, true);
    let md = home.markdown || "", links = home.links || [], menuUrl = v.website;
    const link = findMenuUrl(home, v.website);
    if (link && link !== v.website) {
      const m = await firecrawl(link, true);
      if (m.markdown && m.markdown.length > 120) { md = m.markdown; links = m.links || links; menuUrl = link; }
    }

    let items = (md && md.length >= 120) ? await parseMenuText(md) : [];
    let vis = 0;

    if (!VISION_OFF && items.length < VTHRESH) {
      const { images, pdfs } = collectAssets(md, links, menuUrl);
      for (const u of pdfs.slice(0, PDF_PER_VENUE)) {
        const b = await fetchB64(u, 4500000, 12000);
        if (b) { items = items.concat(await visionPdf(b)); vis++; }
      }
      for (const u of images.slice(0, IMG_PER_VENUE)) {
        const b = await fetchB64(u);
        if (b) { items = items.concat(await visionImage(b, mediaFromUrl(u))); vis++; }
      }
    }

    const seen = new Set(), valid = [];
    for (const it of items) {
      if (!it || !it.name || typeof it.price !== "number" || !(it.price > 0 && it.price < 5000)) continue;
      const k = String(it.name).toLowerCase().trim() + "|" + it.price;
      if (seen.has(k)) continue; seen.add(k); valid.push(it);
      if (valid.length >= 180) break;
    }

    if (!valid.length) { await pool.query("UPDATE venues SET menu_scraped_at=now() WHERE id=$1", [v.id]); console.log("MENU  ", v.name, "-> 0 items", vis ? `(vision x${vis})` : ""); return { empty: 1, vis }; }

    await pool.query("DELETE FROM menu_items WHERE venue_id=$1", [v.id]);
    for (const it of valid) {
      await pool.query(
        "INSERT INTO menu_items (venue_id,name,price,category,section,source_url,last_seen_at) VALUES ($1,$2,$3,$4,$5,$6,now())",
        [v.id, String(it.name).slice(0, 140), it.price, (it.category || "other").toLowerCase().slice(0, 20), (it.section || "").slice(0, 80), menuUrl]);
    }
    await pool.query("UPDATE venues SET menu_scraped_at=now() WHERE id=$1", [v.id]);
    console.log("MENU  ", v.name, "->", valid.length, "items", vis ? `(vision x${vis})` : "");
    return { parsed: 1, items: valid.length, vis };
  } catch (e) { console.log("FAIL  ", v.name, String(e).slice(0, 50)); return { failed: 1 }; }
}

async function main() {
  await ensureSchema(pool);
  const LIMIT = Number(process.env.MENU_LIMIT || 0);
  const FORCE = process.env.MENU_FORCE === "1";
  const NAME = process.env.MENU_NAME;
  const { rows } = await pool.query(
    `SELECT v.id, v.name, COALESCE(NULLIF(v.website,''), st.url) AS website
     FROM venues v
     LEFT JOIN LATERAL (SELECT url FROM scrape_targets s WHERE s.venue_id = v.id AND s.active ORDER BY s.id LIMIT 1) st ON true
     WHERE COALESCE(NULLIF(v.website,''), st.url) IS NOT NULL`
    + (FORCE ? "" : " AND v.menu_scraped_at IS NULL")
    + (NAME ? ` AND v.name ILIKE '%${NAME.replace(/'/g, "")}%'` : "")
    + ` ORDER BY v.menu_scraped_at ASC NULLS FIRST` + (LIMIT > 0 ? ` LIMIT ${LIMIT}` : ""));
  const CONC = Number(process.env.MENU_CONC || 3);
  const DELAY = Number(process.env.MENU_DELAY_MS || 400);
  console.log(`Menu scrape: ${rows.length} venues · conc=${CONC} · vision=${VISION_OFF ? "off" : `on (text<${VTHRESH})`}`);
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
