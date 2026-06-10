// Seeds Postgres with the schema + the 10 starter venues/specials.
// Usage: DATABASE_URL=... node db/seed.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dir = dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;

if (!process.env.DATABASE_URL) { console.error("Set DATABASE_URL first."); process.exit(1); }
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false },
});

const venues = [
  ["v_herbsrye","Herbs & Rye","Steakhouse / Cocktail Bar","West of Strip",12],
  ["v_ellisisland","Ellis Island Casino & Brewery","Casino Brewpub","Off-Strip (East)",18],
  ["v_oysterbar","The Oyster Bar at Palace Station","Seafood / Oyster Bar","Off-Strip (West)",22],
  ["v_yardbird","Yardbird Southern Table & Bar","Southern / American","Strip",6],
  ["v_beerhaus","Beerhaus","Beer Hall / Burgers","Strip",9],
  ["v_hexx","HEXX Kitchen & Bar","American / Gastropub","Strip",7],
  ["v_sakerok","Sake Rok","Japanese / Izakaya","Strip",10],
  ["v_carson","Carson Kitchen","Gastropub / New American","Downtown",25],
  ["v_parkfremont","Park on Fremont","Bar / Gastropub","Downtown",26],
  ["v_ichiza","Ichiza","Japanese Izakaya","Chinatown",20],
];
const specials = [
  ["v_herbsrye","happy_hour","50% off entire menu — cocktails, wine, beer, apps, oysters, steaks",true,true,false,"Daily","5:00 PM","8:00 PM","Also late-night 11:59 PM–3 AM","venue",90,"live"],
  ["v_ellisisland","happy_hour","$7 bites & drinks; free beer for vets daily; $9.99 steak 24/7",true,true,true,"Mon–Fri","3:00 PM","6:00 PM","Some specials need players card","venue",85,"live"],
  ["v_oysterbar","happy_hour","$1 oysters happy hour; open 24/7",true,false,false,"Daily","Open 24/7","Open 24/7","Pricing may vary","aggregator",75,"live"],
  ["v_yardbird","happy_hour","$5 draft, $6 wine, $7 bourbon cocktails, $5 deviled eggs, $6 biscuits",true,true,false,"Mon–Fri","3:00 PM","5:30 PM","Bar 2–6 PM & 9 PM–close","venue",88,"live"],
  ["v_beerhaus","happy_hour","$9.99 burger & fries (+$4.99 draft), $4–5 drafts, $6 pretzels",true,true,false,"Mon–Thu","2:00 PM","5:00 PM","20+ beers on tap","aggregator",80,"live"],
  ["v_hexx","happy_hour","$4–6 beer, $7+ cocktails & wine, 20% off apps — Strip-view patio",true,true,false,"Daily","2:00 PM","6:00 PM","","aggregator",75,"live"],
  ["v_sakerok","happy_hour","2-for-1 drafts, wells & daiquiris; Sun 6–11 PM half off sake & apps",true,true,false,"Daily","3:00 PM","6:00 PM","","aggregator",72,"live"],
  ["v_carson","happy_hour","$3–7 drinks, $5–8 appetizers (bar only)",true,true,false,"Mon–Fri","3:00 PM","5:00 PM","Time unconfirmed","aggregator",70,"live"],
  ["v_parkfremont","happy_hour","Discounted beers, well cocktails & food on a dog-friendly patio",true,true,false,"TBD","TBD","TBD","Times not confirmed","aggregator",40,"unverified"],
  ["v_ichiza","happy_hour","Food & drink specials; late-night izakaya to ~2:30 AM",true,true,false,"Tue–Sun","3:00 PM","6:00 PM","","aggregator",68,"live"],
];

async function main() {
  const schema = readFileSync(join(__dir, "schema.sql"), "utf8");
  await pool.query(schema);
  for (const v of venues) {
    await pool.query(
      `INSERT INTO venues (id,name,type,neighborhood,walk_min) VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name`, v);
  }
  await pool.query("DELETE FROM specials");
  for (const s of specials) {
    await pool.query(
      `INSERT INTO specials (venue_id,category,summary,food,drink,freebie,days,start_time,end_time,fine_print,source,confidence,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`, s);
  }
  const { rows } = await pool.query("SELECT count(*) FROM specials");
  console.log(`Seeded ${venues.length} venues, ${rows[0].count} specials.`);
  await pool.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
