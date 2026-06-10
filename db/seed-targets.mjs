import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
// venues that scrape targets attach to (create if missing)
const venues = [
  ["v_ellisisland","Ellis Island Casino & Brewery","Casino Brewpub","Off-Strip (East)",18],
  ["v_strat","The STRAT Hotel, Casino & Tower","Casino Resort","Strip (North)",15],
  ["v_sahara","SAHARA Las Vegas","Casino Resort","Strip (North)",14],
  ["v_southpoint","South Point Hotel & Casino","Casino Resort","Off-Strip (South)",30],
  ["v_circa","Circa Resort & Casino","Casino Resort","Downtown",26],
];
const targets = [
  ["https://www.ellisislandcasino.com/promotions","v_ellisisland","promo_hub"],
  ["https://thestrat.com/special-offers","v_strat","promo_hub"],
  ["https://www.saharalasvegas.com/promotions","v_sahara","promo_hub"],
  ["https://www.southpointcasino.com/promotions","v_southpoint","promo_hub"],
  ["https://www.circalasvegas.com/promotions","v_circa","promo_hub"],
];
await pool.query(`CREATE TABLE IF NOT EXISTS scrape_targets (id SERIAL PRIMARY KEY,url TEXT UNIQUE NOT NULL,venue_id TEXT,kind TEXT DEFAULT 'venue_hh',active BOOLEAN DEFAULT true,last_hash TEXT,last_scraped_at TIMESTAMPTZ,last_status TEXT)`);
for (const v of venues) await pool.query(`INSERT INTO venues (id,name,type,neighborhood,walk_min) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (id) DO NOTHING`, v);
for (const t of targets) await pool.query(`INSERT INTO scrape_targets (url,venue_id,kind) VALUES ($1,$2,$3) ON CONFLICT (url) DO NOTHING`, t);
const c = await pool.query("SELECT count(*) FROM scrape_targets WHERE active");
console.log("active scrape targets:", c.rows[0].count);
await pool.end();
