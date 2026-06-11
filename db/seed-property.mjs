import pg from "pg";
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) { console.error("GOOGLE_PLACES_API_KEY required"); process.exit(1); }
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PL = { PRICE_LEVEL_FREE:0, PRICE_LEVEL_INEXPENSIVE:1, PRICE_LEVEL_MODERATE:2, PRICE_LEVEL_EXPENSIVE:3, PRICE_LEVEL_VERY_EXPENSIVE:4 };
const MASK = "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.photos,places.reviews,places.regularOpeningHours,places.nationalPhoneNumber,places.websiteUri";

async function find(q) {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": MASK },
    body: JSON.stringify({ textQuery: q, pageSize: 1 }) });
  const j = await r.json(); return (j.places || [])[0] || null;
}
function rowFrom(p) {
  return {
    lat: p.location?.latitude, lng: p.location?.longitude, rating: p.rating || null,
    price_level: (p.priceLevel in PL ? PL[p.priceLevel] : null),
    photo_ref: p.photos?.[0]?.name || null,
    photos: JSON.stringify((p.photos||[]).slice(0,6).map(x=>x.name)),
    reviews: JSON.stringify((p.reviews||[]).slice(0,3).map(r=>({author:r.authorAttribution?.displayName||"Google user", avatar:r.authorAttribution?.photoUri||null, rating:r.rating||null, text:(r.text?.text||"").slice(0,600), time:r.relativePublishingTimeDescription||""}))),
    hours: p.regularOpeningHours ? JSON.stringify(p.regularOpeningHours) : null,
    phone: p.nationalPhoneNumber || null, website: p.websiteUri || null,
    addr: p.formattedAddress || "", place: p.id || null,
  };
}
async function upsert(id, name, type, neighborhood, parent, p) {
  const e = rowFrom(p);
  await pool.query(
    `INSERT INTO venues (id,name,type,neighborhood,parent_id,address,lat,lng,rating,price_level,photo_ref,photos,reviews,hours,phone,website,google_place_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT (id) DO UPDATE SET parent_id=EXCLUDED.parent_id, rating=EXCLUDED.rating, photo_ref=EXCLUDED.photo_ref, photos=EXCLUDED.photos, reviews=EXCLUDED.reviews, lat=EXCLUDED.lat, lng=EXCLUDED.lng`,
    [id, name, type, neighborhood, parent, e.addr, e.lat, e.lng, e.rating, e.price_level, e.photo_ref, e.photos, e.reviews, e.hours, e.phone, e.website, e.place]);
}

const PARENT = { id: "v_aria", name: "ARIA Resort & Casino", query: "ARIA Resort and Casino Las Vegas", type: "Casino Resort", hood: "Strip" };
const OUTLETS = [
  ["Jean Georges Steakhouse Aria Las Vegas","Steakhouse"],["Bardot Brasserie Aria Las Vegas","French"],
  ["Carbone Aria Las Vegas","Italian"],["Catch Aria Las Vegas","Seafood"],
  ["Din Tai Fung Aria Las Vegas","Dumplings"],["Javier's Aria Las Vegas","Mexican"],
  ["Sage Aria Las Vegas","American"],["Lemongrass Aria Las Vegas","Thai"],
  ["Herringbone Aria Las Vegas","Seafood"],["Tetsu Aria Las Vegas","Teppanyaki"],
];
async function main() {
  const pp = await find(PARENT.query);
  if (pp) { await upsert(PARENT.id, PARENT.name, PARENT.type, PARENT.hood, null, pp); console.log("parent ARIA created"); }
  let n = 0;
  for (let i = 0; i < OUTLETS.length; i += 5) {
    await Promise.all(OUTLETS.slice(i, i+5).map(async ([q, type]) => {
      const p = await find(q); if (!p) return;
      const name = (p.displayName?.text || q).replace(/ ?(- )?Aria.*/i, "").trim();
      await upsert("g_" + p.id, name, type, PARENT.hood, PARENT.id, p); n++;
    }));
  }
  console.log("ARIA child restaurants created:", n);
  await pool.end();
}
main().catch(e=>{console.error(e);process.exit(1);});
