// Dish canonicalizer. Collapses messy menu item names into ONE canonical dish
// per real dish, so "Buttermilk pancakes with eggs", "Short stack", "Banana
// pancakes" all map to a single /price/pancakes page (no duplicate pages).
// Strategy: classify each DISTINCT raw name once (cached in dish_map), and feed
// the model the dishes it has ALREADY named so it reuses them instead of
// inventing near-duplicates. Then stamp menu_items.dish from the map.
// Run: node db/dishes.mjs   Env: DISH_BATCH (default 60), DISH_FORCE=1
import pg from "pg";
import { ensureSchema } from "./migrate.mjs";

const ANTHROPIC = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC) { console.error("ANTHROPIC_API_KEY required"); process.exit(1); }
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Curated dishes seed the canon so auto-mapping snaps to existing page slugs.
const SEED = [
  ["steak", "Steak"], ["burger", "Burger"], ["wings", "Wings"], ["oysters", "Oysters"],
  ["lobster", "Lobster"], ["dessert", "Dessert"], ["margarita", "Margarita"], ["martini", "Martini"],
  ["mimosa", "Mimosa"], ["cocktail", "Cocktail"], ["draft-beer", "Draft Beer"], ["house-wine", "House Wine"],
];

const slugify = (s) => s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

const SYS = `You normalize raw restaurant/bar menu item names into CANONICAL DISH pages for a Las Vegas price-comparison site. The whole point: many raw names must collapse onto ONE canonical dish so there is a single page per dish.
Examples: "Buttermilk pancakes with eggs", "Short stack pancakes", "Banana pancakes" -> dish "pancakes". "8oz Ribeye", "Bone-in ribeye" -> "ribeye". "Classic cheeseburger", "Bacon double burger" -> "burger".
You are given EXISTING canonical dishes — REUSE one whenever the item is that dish; never invent a near-duplicate of an existing dish.
Return ONLY JSON: {"map":[{"raw":string,"dish":string,"label":string}]} with one entry per input name (raw must equal the input exactly).
Rules:
- "label" = the canonical display name in Title Case. "dish" = lowercase slug of the label (a-z 0-9 dashes).
- Use the natural PLURAL for countable foods: pancakes, wings, tacos, oysters, sliders, fries, tater tots, deviled eggs.
- Collapse cooking method, size, sides, garnish, and brand modifiers. A ribeye and a filet mignon are DIFFERENT dishes; a chocolate-chip pancake and a buttermilk pancake are the SAME dish ("pancakes").
- Reuse an existing canonical dish slug verbatim when it fits.
- Return dish:"" (skip) for: pure add-ons/sides-modifiers ("add egg", "extra cheese"), vague combos/platters, "market price" with no number, and section headers.`;

async function classify(names, known) {
  const knownList = known.length ? known.map((k) => `${k.dish} = ${k.label}`).join("\n") : "(none yet)";
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": ANTHROPIC, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001", max_tokens: 4000, system: SYS,
      messages: [{ role: "user", content: `EXISTING canonical dishes (reuse these when they fit):\n${knownList}\n\nNEW raw names to classify:\n${names.map((n, i) => `${i + 1}. ${n}`).join("\n")}` }],
    }),
  });
  const j = await r.json();
  const txt = j?.content?.[0]?.text || "{}";
  try { return JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1)).map || []; } catch { return []; }
}

async function main() {
  await ensureSchema(pool);
  const FORCE = process.env.DISH_FORCE === "1";
  const BATCH = Number(process.env.DISH_BATCH || 60);
  if (FORCE) { await pool.query("TRUNCATE dish_map"); await pool.query("UPDATE menu_items SET dish=NULL, dish_label=NULL"); }

  // distinct raw names not yet mapped
  const { rows: todo } = await pool.query(
    `SELECT DISTINCT lower(trim(name)) raw FROM menu_items
     WHERE name IS NOT NULL AND length(trim(name))>1
       AND lower(trim(name)) NOT IN (SELECT raw_name FROM dish_map)
     ORDER BY 1`);
  console.log(`Dish canon: ${todo.length} new distinct names · batch=${BATCH}`);

  // load known canon (seed + already-mapped) into an in-memory, de-duped list
  const knownMap = new Map();
  for (const [d, l] of SEED) knownMap.set(d, l);
  const { rows: existing } = await pool.query("SELECT DISTINCT dish, dish_label FROM dish_map WHERE dish<>''");
  for (const e of existing) knownMap.set(e.dish, e.dish_label);

  let mapped = 0, skipped = 0;
  for (let i = 0; i < todo.length; i += BATCH) {
    const names = todo.slice(i, i + BATCH).map((r) => r.raw);
    const known = [...knownMap].map(([dish, label]) => ({ dish, label }));
    const res = await classify(names, known);
    const byRaw = new Map(res.map((m) => [String(m.raw || "").toLowerCase().trim(), m]));
    for (const nm of names) {
      const m = byRaw.get(nm) || {};
      let dish = String(m.dish || "").trim();
      let label = String(m.label || "").trim();
      if (dish) { dish = slugify(dish); if (!label) label = dish; }
      else { skipped++; }
      await pool.query(
        "INSERT INTO dish_map (raw_name,dish,dish_label) VALUES ($1,$2,$3) ON CONFLICT (raw_name) DO UPDATE SET dish=$2, dish_label=$3",
        [nm, dish, label]);
      if (dish) { knownMap.set(dish, label); mapped++; } // grow canon so later batches reuse it
    }
    console.log(`  batch ${i / BATCH + 1}: +${names.length} (canon size ${knownMap.size})`);
    await pool.query(`UPDATE menu_items mi SET dish = dm.dish, dish_label = dm.dish_label FROM dish_map dm WHERE lower(trim(mi.name)) = dm.raw_name AND mi.dish IS NULL`);
  }

  // stamp menu_items from the map
  await pool.query(
    `UPDATE menu_items mi SET dish = dm.dish, dish_label = dm.dish_label
     FROM dish_map dm WHERE lower(trim(mi.name)) = dm.raw_name`);

  const { rows: top } = await pool.query(
    `SELECT dish_label, count(DISTINCT venue_id)::int venues, count(*)::int items
     FROM menu_items WHERE dish<>'' AND dish IS NOT NULL
     GROUP BY dish_label ORDER BY venues DESC, items DESC LIMIT 15`);
  console.log(`DONE dishes · mapped=${mapped} skipped=${skipped}`);
  console.table(top);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
