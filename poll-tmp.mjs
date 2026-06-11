import pg from "pg";
const p = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const f = await p.query("SELECT count(*) FROM specials WHERE source='firecrawl'");
const parsed = await p.query("SELECT count(*) FROM scrape_targets WHERE last_status='parsed'");
const live = await p.query("SELECT count(*) FROM specials WHERE status='live'");
console.log("firecrawl specials:", f.rows[0].count, "| targets parsed:", parsed.rows[0].count, "| total live specials:", live.rows[0].count);
await p.end();
