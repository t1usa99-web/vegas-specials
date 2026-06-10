import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
const __dir = dirname(fileURLToPath(import.meta.url));
if (!process.env.DATABASE_URL) { console.error("Set DATABASE_URL"); process.exit(1); }
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const { AUTHORS, POSTS } = await import("../lib/blogdata.mjs");

async function main() {
  await pool.query(readFileSync(join(__dir, "blog-schema.sql"), "utf8"));
  for (const a of AUTHORS) {
    await pool.query(
      `INSERT INTO authors (id,slug,name,role,title,bio,expertise,grad,joined) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, role=EXCLUDED.role, title=EXCLUDED.title, bio=EXCLUDED.bio`,
      [a.id, a.slug, a.name, a.role, a.title, a.bio, a.expertise, a.grad, a.joined]);
  }
  await pool.query("DELETE FROM posts");
  for (const p of POSTS) {
    await pool.query(
      `INSERT INTO posts (slug,title,excerpt,body,author_id,status,published_at,read_min,tag) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [p.slug, p.title, p.excerpt, p.body, p.author_id, p.status, p.published_at, p.read_min, p.tag]);
  }
  const c = await pool.query("SELECT count(*) FROM posts");
  console.log(`Seeded ${AUTHORS.length} authors, ${c.rows[0].count} posts.`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
