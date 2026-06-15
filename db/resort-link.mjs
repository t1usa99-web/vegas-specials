// Map resort outlets to their parent casino by shared street address.
// Everything at a resort's building address is one of its outlets, so we set
// parent_id to that resort. High precision: only acts within an address cluster
// whose parent is a real, named resort (MAJORS). Seeds clean parents for a few
// marquee resorts whose address has only outlets. Never links across addresses,
// never overrides an existing parent, never makes a casino a child.
// Run: node db/resort-link.mjs   (RESORT_LINK_COMMIT=1 to apply)
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const COMMIT = process.env.RESORT_LINK_COMMIT === "1";

const street = (a) => (a || "").split(",")[0].toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
const MAJORS = /\b(aria|bellagio|venetian|palazzo|caesars palace|mgm grand|mandalay bay|wynn|encore|resorts world|paris las vegas|planet hollywood|cosmopolitan|fontainebleau|circa|golden nugget|red rock|durango|green valley ranch|palace station|sunset station|boulder station|santa fe station|westgate|sahara|strat|south point|the mirage|treasure island|luxor|excalibur|new york-new york|park mgm|nomad|the linq|flamingo|harrah|horseshoe|the d|fremont hotel|main street station|california hotel|plaza hotel|downtown grand|virgin hotels|hard rock|palms|the resort at summerlin)\b/i;
const OUTLET = /\b(bar|lounge|room|sports ?book|poker|piano|promenade|monorail|buffet|steakhouse|pizzeria|grill|kitchen|cafe|nightclub|dayclub|speakeasy|cocktail|bistro|cantina|deli|microbrewery|pool)\b/i;
const isResort = (v) => /\b(resort|casino)\b/i.test(v.name) || /resort|casino/i.test(v.type || "") || MAJORS.test(v.name);
function score(v) {
  return (v.id.startsWith("v_") ? 1000 : 0) + (MAJORS.test(v.name) ? 100 : 0) + (/\b(resort|casino)\b/i.test(v.name) ? 50 : 0) +
    (/hotel/i.test(v.name) ? 10 : 0) - (OUTLET.test(v.name) ? 80 : 0) - (/ at /i.test(v.name) ? 60 : 0) - v.name.length * 0.05;
}
// Marquee resorts whose building address holds only outlets — seed a clean parent.
const REGISTRY = {
  "3355 s las vegas blvd": { id: "v_venetian", name: "The Venetian Resort", lat: 36.1212, lng: -115.1696, addr: "3355 S Las Vegas Blvd, Las Vegas, NV 89109" },
  "3570 las vegas blvd s": { id: "v_caesarspalace", name: "Caesars Palace", lat: 36.1162, lng: -115.1745, addr: "3570 Las Vegas Blvd S, Las Vegas, NV 89109" },
  "mgm grand": { id: "v_mgmgrand", name: "MGM Grand Hotel & Casino", lat: 36.1025, lng: -115.1686, addr: "MGM Grand, 3799 S Las Vegas Blvd, Las Vegas, NV 89109" },
  "3799 s las vegas blvd": { id: "v_mgmgrand", name: "MGM Grand Hotel & Casino", lat: 36.1025, lng: -115.1686, addr: "MGM Grand, 3799 S Las Vegas Blvd, Las Vegas, NV 89109" },
  "3570 s las vegas blvd": { id: "v_caesarspalace", name: "Caesars Palace", lat: 36.1162, lng: -115.1745, addr: "3570 Las Vegas Blvd S, Las Vegas, NV 89109" },
};

async function main() {
  const { rows } = await pool.query("SELECT id, name, type, address, parent_id FROM venues WHERE merged_into IS NULL AND COALESCE(address,'')<>''");
  const clusters = new Map();
  for (const v of rows) { const k = street(v.address); if (k.length < 4) continue; (clusters.get(k) || clusters.set(k, []).get(k)).push(v); }

  const ensured = []; // registry parents to create
  const links = [];
  for (const [addr, members] of clusters) {
    if (members.length < 2) continue;
    let parent;
    if (REGISTRY[addr]) {
      const reg = REGISTRY[addr];
      parent = members.find((m) => m.id === reg.id) || { id: reg.id, name: reg.name, _create: reg };
      if (parent._create && !ensured.find((e) => e.id === reg.id)) ensured.push(reg);
    } else {
      const cands = members.filter(isResort).sort((a, b) => score(b) - score(a));
      if (!cands.length || !MAJORS.test(cands[0].name)) continue; // require a real named resort
      parent = cands[0];
    }
    for (const v of members) {
      if (v.id === parent.id || v.parent_id || isResort(v)) continue;
      links.push({ parent, child: v });
    }
  }

  const byParent = new Map();
  for (const l of links) { (byParent.get(l.parent.id) || byParent.set(l.parent.id, { name: l.parent.name, kids: [] }).get(l.parent.id)).kids.push(l.child.name); }
  console.log(`Resort-link ${COMMIT ? "(COMMIT)" : "(DRY-RUN)"}: ${links.length} outlets -> ${byParent.size} resorts  (seeding ${ensured.length} parents)`);
  for (const [, g] of [...byParent.entries()].sort((a, b) => b[1].kids.length - a[1].kids.length))
    console.log(`\n  ${g.name}  (+${g.kids.length})\n    ${g.kids.sort().join(", ")}`);

  if (!COMMIT) { console.log("\nDRY-RUN only. Set RESORT_LINK_COMMIT=1 to apply."); await pool.end(); return; }
  const c = await pool.connect();
  try {
    await c.query("BEGIN");
    for (const r of ensured)
      await c.query("INSERT INTO venues (id,name,type,neighborhood,address,lat,lng,created_at) VALUES ($1,$2,'Resort / Casino','Strip',$3,$4,$5,now()) ON CONFLICT (id) DO NOTHING", [r.id, r.name, r.addr, r.lat, r.lng]);
    for (const l of links) await c.query("UPDATE venues SET parent_id=$1 WHERE id=$2 AND parent_id IS NULL", [l.parent.id, l.child.id]);
    await c.query("COMMIT");
    console.log(`\nCOMMIT ok — seeded ${ensured.length} parents, linked ${links.length} outlets.`);
  } catch (e) { await c.query("ROLLBACK"); console.error("ROLLBACK", String(e)); } finally { c.release(); }
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
