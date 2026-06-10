CREATE TABLE IF NOT EXISTS authors (
  id        TEXT PRIMARY KEY,
  slug      TEXT UNIQUE NOT NULL,
  name      TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'author',   -- admin | editor | author
  title     TEXT,
  bio       TEXT,
  expertise TEXT,
  grad      TEXT,
  joined    TEXT
);
CREATE TABLE IF NOT EXISTS posts (
  id           SERIAL PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  excerpt      TEXT,
  body         TEXT,
  author_id    TEXT REFERENCES authors(id),
  status       TEXT NOT NULL DEFAULT 'draft',  -- draft | in_review | published
  published_at TIMESTAMPTZ DEFAULT now(),
  read_min     INTEGER DEFAULT 4,
  tag          TEXT
);
CREATE TABLE IF NOT EXISTS subscribers (
  id         SERIAL PRIMARY KEY,
  email      TEXT UNIQUE NOT NULL,
  source     TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status, published_at DESC);
