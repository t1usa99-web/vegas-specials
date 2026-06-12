// Idempotent schema reconciliation. Safe to run repeatedly and against the live DB.
// Brings any environment up to the full column set the app + scraper expect,
// adds the trust columns, useful indexes, and backfills honest verification state.
import pg from "pg";
const { Pool } = pg;

export const MIGRATIONS = [
  // ---- venues: enrichment + hierarchy columns ----
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS parent_id   TEXT`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS cuisine     TEXT`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS vibe_tags   JSONB`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS rating      DOUBLE PRECISION`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS price_level INTEGER`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS photo_ref   TEXT`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS photos      JSONB`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS reviews     JSONB`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS hours       JSONB`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS phone       TEXT`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS website     TEXT`,
  `ALTER TABLE venues ADD COLUMN IF NOT EXISTS description TEXT`,
  // ---- specials: structured deal columns ----
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS reverse_window TEXT`,
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS price          NUMERIC`,
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS discount_type  TEXT`,
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS outlet         TEXT`,
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS source_url     TEXT`,
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS items          JSONB`,
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS valid_until    DATE`,
  // ---- specials: trust / verification columns ----
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS verified_count INTEGER DEFAULT 0`,
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS flagged_count  INTEGER DEFAULT 0`,
  `ALTER TABLE specials ADD COLUMN IF NOT EXISTS last_seen_at   TIMESTAMPTZ`,
  // ---- events (Ticketmaster / SeatGeek ingestion) ----
  `CREATE TABLE IF NOT EXISTS events (
     id TEXT PRIMARY KEY, source TEXT, name TEXT, category TEXT,
     venue_name TEXT, venue_id TEXT, starts_at TIMESTAMPTZ,
     url TEXT, image_url TEXT, price_min NUMERIC, price_max NUMERIC,
     lat DOUBLE PRECISION, lng DOUBLE PRECISION, neighborhood TEXT,
     status TEXT DEFAULT 'live', last_seen_at TIMESTAMPTZ, created_at TIMESTAMPTZ DEFAULT now())`,
  `CREATE INDEX IF NOT EXISTS idx_events_starts ON events(starts_at)`,
  `CREATE INDEX IF NOT EXISTS idx_events_category ON events(category)`,
  // ---- indexes for the new landing / resort / open-now queries ----
  `CREATE INDEX IF NOT EXISTS idx_venues_parent   ON venues(parent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_specials_category ON specials(category)`,
  `CREATE INDEX IF NOT EXISTS idx_specials_venue    ON specials(venue_id)`,
  `CREATE INDEX IF NOT EXISTS idx_specials_status   ON specials(status)`,
];

// Backfill: stop claiming machine-scraped rows are human-"verified".
// Keep a machine freshness time (last_seen_at), and only treat last_verified_at
// as a *human* signal (null it out for auto-detected rows nobody has confirmed).
export const BACKFILL = [
  `UPDATE specials SET last_seen_at = COALESCE(last_seen_at, last_verified_at)
     WHERE source = 'firecrawl' AND last_seen_at IS NULL`,
  `UPDATE specials SET last_verified_at = NULL
     WHERE source = 'firecrawl' AND COALESCE(verified_count,0) = 0`,
];

export async function ensureSchema(pool) {
  for (const sql of MIGRATIONS) await pool.query(sql);
}

async function main() {
  if (!process.env.DATABASE_URL) { console.error("No DATABASE_URL"); process.exit(1); }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  console.log("Running schema migrations…");
  for (const sql of MIGRATIONS) { await pool.query(sql); process.stdout.write("."); }
  console.log("\nRunning backfill…");
  for (const sql of BACKFILL) { const r = await pool.query(sql); console.log("  ", r.rowCount, "rows ←", sql.split("\n")[0].trim()); }
  const cols = await pool.query(`SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('venues','specials') ORDER BY table_name, ordinal_position`);
  console.log("\nFinal columns:");
  console.log(cols.rows.reduce((a, r) => { (a[r.table_name] ||= []).push(r.column_name); return a; }, {}));
  await pool.end();
  console.log("Migration complete ✓");
}

if (import.meta.url === `file://${process.argv[1]}`) main().catch((e) => { console.error(e); process.exit(1); });
