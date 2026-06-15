// Safe, non-destructive venue dedupe.
// Two records are the SAME venue only if they share a normalized name AND are at
// the same physical location (same street address OR coordinates within ~150m).
// This keeps different locations of a chain (Bourbon St, PT's Gold, etc.) separate.
// Within a duplicate cluster we keep the richest record (most deals/menu/data) as
// canonical, repoint specials + menu_items + parent_id onto it, enrich it with any
// data the canonical was missing, and mark the others merged_into=<canonical>.
// Nothing is deleted. Run: node db/dedupe.mjs   (DEDUPE_COMMIT=1 to apply)
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const COMMIT = process.env.DEDUPE_COMMIT === "1";

const norm = (s) => (s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const street = (a) => norm((a || "").split(",")[0]); // street address before first comma
function dist(a, b) {
  if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) return Infinity;
  const R = 6371000, toR = (d) => d * Math.PI / 180;
  const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}
const samePlace = (a, b) => (street(a.address) && street(a.address) === street(b.address)) || dist(a, b) <= 150;
const score = (v) => v.deals * 100 + v.menu * 5 + (v.website ? 10 : 0) + (v.photos ? 5 : 0) + (v.lat != null ? 3 : 0) + (v.rating ? 2 : 0) + (street(v.address) ? 2 : 0);

async function main() {
  await pool.query("ALTER TABLE venues ADD COLUMN IF NOT EXISTS merged_into TEXT");
  const { rows } = await pool.query(`
    SELECT v.id, v.name, v.address, v.lat, v.lng, v.website, v.photos, v.rating, v.parent_id, v.google_place_id, v.phone, v.photo_ref, v.description, v.cuisine, v.vibe_tags, v.hours,
           (SELECT count(*) FROM specials s WHERE s.venue_id=v.id AND s.status='live')::int deals,
           (SELECT count(*) FROM menu_items m WHERE m.venue_id=v.id)::int menu
    FROM venues v WHERE v.merged_into IS NULL`);

  // group by normalized name
  const groups = new Map();
  for (const v of rows) { const k = norm(v.name); if (!k) continue; (groups.get(k) || groups.set(k, []).get(k)).push(v); }

  const merges = []; // {canonical, dup}
  for (const [, members] of groups) {
    if (members.length < 2) continue;
    // union-find clusters by samePlace
    const parent = members.map((_, i) => i);
    const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
    for (let i = 0; i < members.length; i++) for (let j = i + 1; j < members.length; j++)
      if (samePlace(members[i], members[j])) parent[find(i)] = find(j);
    const clusters = new Map();
    members.forEach((m, i) => { const r = find(i); (clusters.get(r) || clusters.set(r, []).get(r)).push(m); });
    for (const [, cl] of clusters) {
      if (cl.length < 2) continue;
      cl.sort((a, b) => score(b) - score(a));
      const canonical = cl[0];
      for (const dup of cl.slice(1)) merges.push({ canonical, dup });
    }
  }

  console.log(`Dedupe ${COMMIT ? "(COMMIT)" : "(DRY-RUN)"}: ${merges.length} duplicate records across ${new Set(merges.map(m => m.canonical.id)).size} canonical venues`);
  for (const { canonical, dup } of merges)
    console.log(`  "${dup.name}" [${dup.id.slice(0, 10)} d${dup.deals}/m${dup.menu}] -> "${canonical.name}" [${canonical.id.slice(0, 10)} d${canonical.deals}/m${canonical.menu}]`);

  if (!COMMIT) { console.log("\nDRY-RUN only. Set DEDUPE_COMMIT=1 to apply."); await pool.end(); return; }

  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    for (const { canonical, dup } of merges) {
      // repoint deals/menus that don't already exist on canonical (avoid visible dupes)
      await c.query(`UPDATE specials SET venue_id=$1 WHERE venue_id=$2 AND NOT EXISTS (SELECT 1 FROM specials s2 WHERE s2.venue_id=$1 AND s2.summary=specials.summary)`, [canonical.id, dup.id]);
      await c.query(`UPDATE menu_items SET venue_id=$1 WHERE venue_id=$2 AND NOT EXISTS (SELECT 1 FROM menu_items m2 WHERE m2.venue_id=$1 AND lower(m2.name)=lower(menu_items.name) AND m2.price=menu_items.price)`, [canonical.id, dup.id]);
      await c.query(`UPDATE venues SET parent_id=$1 WHERE parent_id=$2`, [canonical.id, dup.id]);
      // enrich canonical with anything it's missing
      await c.query(`UPDATE venues c SET
          website   = COALESCE(NULLIF(c.website,''), $2),
          lat       = COALESCE(c.lat, $3), lng = COALESCE(c.lng, $4),
          address   = COALESCE(NULLIF(c.address,''), $5),
          rating    = COALESCE(c.rating, $6),
          phone     = COALESCE(NULLIF(c.phone,''), $7),
          photo_ref = COALESCE(NULLIF(c.photo_ref,''), $8),
          description = COALESCE(NULLIF(c.description,''), $9),
          cuisine   = COALESCE(NULLIF(c.cuisine,''), $10),
          google_place_id = COALESCE(NULLIF(c.google_place_id,''), $11)
        WHERE c.id=$1`,
        [canonical.id, dup.website, dup.lat, dup.lng, dup.address, dup.rating, dup.phone, dup.photo_ref, dup.description, dup.cuisine, dup.google_place_id]);
      // mark the duplicate merged + unparent so it never surfaces
      await c.query(`UPDATE venues SET merged_into=$1, parent_id=NULL WHERE id=$2`, [canonical.id, dup.id]);
    }
    await c.query("COMMIT");
    console.log(`COMMIT ok — ${merges.length} records merged.`);
  } catch (e) { await c.query("ROLLBACK"); console.error("ROLLBACK", String(e)); } finally { c.release(); }
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
