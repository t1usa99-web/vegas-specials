-- Vegas Specials core schema (Postgres) — complete source of truth.
-- For an existing DB, db/migrate.mjs applies the same columns idempotently.
CREATE TABLE IF NOT EXISTS venues (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT,
  neighborhood  TEXT,
  resort        TEXT,
  parent_id     TEXT,                 -- self-reference: outlet -> mega-property
  address       TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  walk_min      INTEGER,
  cuisine       TEXT,
  vibe_tags     JSONB,
  rating        DOUBLE PRECISION,
  price_level   INTEGER,
  photo_ref     TEXT,
  photos        JSONB,
  reviews       JSONB,
  hours         JSONB,
  phone         TEXT,
  website       TEXT,
  description   TEXT,
  google_place_id TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS specials (
  id            SERIAL PRIMARY KEY,
  venue_id      TEXT REFERENCES venues(id),
  category      TEXT,
  summary       TEXT,
  food          BOOLEAN DEFAULT false,
  drink         BOOLEAN DEFAULT false,
  freebie       BOOLEAN DEFAULT false,
  days          TEXT,
  start_time    TEXT,
  end_time      TEXT,
  reverse_window TEXT,
  price         NUMERIC,
  discount_type TEXT,
  outlet        TEXT,
  items         JSONB,
  valid_until   DATE,
  fine_print    TEXT,
  source_url    TEXT,
  source        TEXT,
  confidence    INTEGER DEFAULT 50,
  status        TEXT DEFAULT 'unverified',
  -- trust / freshness:
  verified_count INTEGER DEFAULT 0,    -- human confirmations ("still here")
  flagged_count  INTEGER DEFAULT 0,    -- human flags ("gone")
  last_seen_at   TIMESTAMPTZ,          -- machine freshness (last scrape that saw it)
  last_verified_at TIMESTAMPTZ         -- HUMAN verification only (null until confirmed)
);

CREATE TABLE IF NOT EXISTS submissions (
  id            SERIAL PRIMARY KEY,
  venue_guess   TEXT,
  raw_json      JSONB,
  photo_taken_at TIMESTAMPTZ,
  confidence    INTEGER,
  review_status TEXT DEFAULT 'pending',
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_specials_venue    ON specials(venue_id);
CREATE INDEX IF NOT EXISTS idx_specials_status   ON specials(status);
CREATE INDEX IF NOT EXISTS idx_specials_category ON specials(category);
CREATE INDEX IF NOT EXISTS idx_venues_parent     ON venues(parent_id);

CREATE TABLE IF NOT EXISTS events (
  id            TEXT PRIMARY KEY,
  source        TEXT,                 -- ticketmaster | seatgeek
  name          TEXT,
  category      TEXT,                 -- concert | show | sports | comedy | other
  venue_name    TEXT,
  venue_id      TEXT,                 -- nullable link to venues
  starts_at     TIMESTAMPTZ,
  url           TEXT,
  image_url     TEXT,
  price_min     NUMERIC,
  price_max     NUMERIC,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  neighborhood  TEXT,
  status        TEXT DEFAULT 'live',
  last_seen_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_starts ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

CREATE TABLE IF NOT EXISTS menu_items (
  id           SERIAL PRIMARY KEY,
  venue_id     TEXT,
  name         TEXT,
  price        NUMERIC,
  category     TEXT,   -- beer | wine | cocktail | spirit | food | appetizer | entree | steak | seafood | dessert | other
  section      TEXT,
  source_url   TEXT,
  last_seen_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_menu_items_venue ON menu_items(venue_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_cat ON menu_items(category);
