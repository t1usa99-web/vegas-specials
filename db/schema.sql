-- Vegas Specials core schema (Postgres)
CREATE TABLE IF NOT EXISTS venues (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  type          TEXT,
  neighborhood  TEXT,
  resort        TEXT,
  address       TEXT,
  lat           DOUBLE PRECISION,
  lng           DOUBLE PRECISION,
  walk_min      INTEGER,
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
  fine_print    TEXT,
  source        TEXT,
  confidence    INTEGER DEFAULT 50,
  status        TEXT DEFAULT 'unverified',
  last_verified_at TIMESTAMPTZ DEFAULT now()
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

CREATE INDEX IF NOT EXISTS idx_specials_venue ON specials(venue_id);
CREATE INDEX IF NOT EXISTS idx_specials_status ON specials(status);
