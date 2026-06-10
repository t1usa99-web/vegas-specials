import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
// Parsed from a live Firecrawl scrape of ellisislandcasino.com/promotions
const rows = [
  ["v_ellisisland","drink","Industry night: free drink — beer, house wine, or select call drinks — daily, with a local casino ID + state ID",false,true,true,"Daily","All day","All day","Local casino ID + valid state ID required","firecrawl",68,"live"],
  ["v_ellisisland","food","Famous $9.99 Steak Special, available 24/7 in the Village Pub & Cafe",true,false,false,"Daily","Open 24/7","Open 24/7","Dine-in","firecrawl",70,"live"],
];
const r = await pool.query("SELECT count(*) FROM specials");
console.log("specials before:", r.rows[0].count);
for (const s of rows) {
  await pool.query(
    `INSERT INTO specials (venue_id,category,summary,food,drink,freebie,days,start_time,end_time,fine_print,source,confidence,status,last_verified_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now())`, s);
}
const r2 = await pool.query("SELECT count(*) FROM specials WHERE source='firecrawl'");
const r3 = await pool.query("SELECT count(*) FROM specials");
console.log("specials after:", r3.rows[0].count, "| from firecrawl:", r2.rows[0].count);
await pool.end();
