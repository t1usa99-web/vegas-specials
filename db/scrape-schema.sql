CREATE TABLE IF NOT EXISTS scrape_targets (
  id          SERIAL PRIMARY KEY,
  url         TEXT UNIQUE NOT NULL,
  venue_id    TEXT REFERENCES venues(id),
  kind        TEXT DEFAULT 'venue_hh',   -- promo_hub | venue_hh | aggregator
  active      BOOLEAN DEFAULT true,
  last_hash   TEXT,
  last_scraped_at TIMESTAMPTZ,
  last_status TEXT
);
