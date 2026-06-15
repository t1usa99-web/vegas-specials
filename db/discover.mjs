import pg from "pg";
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) { console.error("GOOGLE_PLACES_API_KEY required"); process.exit(1); }
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// neighborhood label -> rough default walking minutes (until real geo distance is added)
const QUERIES = [
  // happy hour by neighborhood
  ["happy hour bars on the Las Vegas Strip", "Strip", 8],
  ["happy hour restaurants Downtown Las Vegas", "Downtown", 20],
  ["happy hour Arts District Las Vegas", "Arts District", 16],
  ["happy hour Chinatown Spring Mountain Las Vegas", "Chinatown", 18],
  ["happy hour Henderson Nevada", "Henderson", 30],
  ["happy hour Summerlin Las Vegas", "Summerlin", 28],
  ["happy hour Spring Valley Las Vegas", "Spring Valley", 20],
  ["happy hour Southwest Las Vegas", "Southwest", 25],
  // cuisines
  ["mexican restaurants Las Vegas", "Off-Strip", 18],
  ["italian restaurants Las Vegas", "Off-Strip", 18],
  ["sushi restaurants Las Vegas", "Off-Strip", 18],
  ["steakhouses Las Vegas", "Strip", 10],
  ["thai restaurants Chinatown Las Vegas", "Chinatown", 18],
  ["seafood restaurants Las Vegas", "Off-Strip", 18],
  ["taco shops Las Vegas", "Off-Strip", 18],
  ["pizza restaurants Las Vegas", "Off-Strip", 18],
  ["bbq restaurants Las Vegas", "Off-Strip", 20],
  ["ramen and izakaya Chinatown Las Vegas", "Chinatown", 18],
  ["french restaurants Las Vegas", "Strip", 10],
  // bar types
  ["sports bars Las Vegas", "Off-Strip", 15],
  ["dive bars Las Vegas", "Off-Strip", 16],
  ["cocktail bars Las Vegas", "Strip", 10],
  ["wine bars Las Vegas", "Off-Strip", 16],
  ["breweries and taprooms Las Vegas", "Off-Strip", 15],
  ["tiki bars Las Vegas", "Strip", 12],
  ["karaoke bars Las Vegas", "Off-Strip", 16],
  ["gay bars Las Vegas Fruit Loop Paradise Road", "Off-Strip (East)", 14],
  ["country bars and honky tonks Las Vegas", "Off-Strip", 18],
  ["hookah lounges Las Vegas", "Strip", 12],
  ["cigar lounges Las Vegas", "Strip", 12],
  ["speakeasy bars Las Vegas", "Strip", 12],
  ["irish pubs Las Vegas", "Strip", 12],
  ["rooftop bars Las Vegas", "Strip", 8],
  ["gastropubs Las Vegas", "Off-Strip", 16],
  // nightlife, pools, gaming
  ["nightclubs Las Vegas", "Strip", 8],
  ["pool clubs and dayclubs Las Vegas", "Strip", 8],
  ["video poker bars Las Vegas locals", "Off-Strip", 16],
  ["lounges Las Vegas Strip", "Strip", 8],
  // locals casinos
  ["Station Casinos Las Vegas", "Off-Strip", 25],
  ["locals casino happy hour Las Vegas", "Off-Strip", 25],
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
        if (lat == null || lng == null || lat < 35.85 || lat > 36.42 || lng < -115.45 || lng > -114.90) continue; // Vegas metro only
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
