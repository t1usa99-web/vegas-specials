import pg from "pg";
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) { console.error("GOOGLE_PLACES_API_KEY required"); process.exit(1); }
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// neighborhood label -> rough default walking minutes (until real geo distance is added)
const QUERIES = [
  ["happy hour bars on the Las Vegas Strip", "Strip", 8],
  ["happy hour restaurants Downtown Las Vegas", "Downtown", 20],
  ["bars Arts District Las Vegas", "Arts District", 14],
  ["bars and izakaya Chinatown Spring Mountain Las Vegas", "Chinatown", 18],
  ["happy hour Henderson Nevada", "Henderson", 30],
  ["happy hour Summerlin Las Vegas", "Summerlin", 28],
  ["sports bars Las Vegas", "Off-Strip", 15],
  ["breweries and taprooms Las Vegas", "Off-Strip", 15],
];
const MASK = "places.id,places.displayName,places.formattedAddress,places.websiteUri,places.location,places.primaryTypeDisplayName,nextPageToken";

async function search(q, token) {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": MASK },
    body: JSON.stringify({ textQuery: q, pageSize: 20, ...(token ? { pageToken: token } : {}) }),
  });
  return r.json();
}

async function main() {
  await pool.query(`CREATE TABLE IF NOT EXISTS scrape_targets (id SERIAL PRIMARY KEY,url TEXT UNIQUE NOT NULL,venue_id TEXT,kind TEXT DEFAULT 'venue_hh',active BOOLEAN DEFAULT true,last_hash TEXT,last_scraped_at TIMESTAMPTZ,last_status TEXT)`);
  let venues = 0, targets = 0, calls = 0;
  for (const [q, hood, walk] of QUERIES) {
    let token = null;
    const PAGES=Number(process.env.DISCOVER_PAGES||2); for (let page = 0; page < PAGES; page++) {           // up to 40 results/query
      const data = await search(q, token); calls++;
      for (const p of data.places || []) {
        const id = "g_" + p.id;
        const name = p.displayName?.text || "";
        const type = p.primaryTypeDisplayName?.text || "Bar / Restaurant";
        const site = p.websiteUri || null;
        const lat = p.location?.latitude || null, lng = p.location?.longitude || null;
        const addr = p.formattedAddress || "";
        if (!name) continue;
        await pool.query(
          `INSERT INTO venues (id,name,type,neighborhood,address,lat,lng,walk_min,google_place_id)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, address=EXCLUDED.address`,
          [id, name, type, hood, addr, lat, lng, walk, p.id]);
        venues++;
        if (site && /^https?:\/\//.test(site)) {
          const r = await pool.query(`INSERT INTO scrape_targets (url,venue_id,kind,active) VALUES ($1,$2,'venue_hh',true) ON CONFLICT (url) DO NOTHING RETURNING id`, [site.replace(/\/$/, ""), id]);
          if (r.rowCount) targets++;
        }
      }
      token = data.nextPageToken;
      if (!token) break;
      await new Promise((r) => setTimeout(r, 2500)); // Places pageToken needs a brief delay
    }
  }
  console.log(`Discovery done. Google calls=${calls}, venues upserted=${venues}, new scrape targets=${targets}`);
  const t = await pool.query("SELECT count(*) FROM scrape_targets WHERE active");
  console.log("total active targets:", t.rows[0].count);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
