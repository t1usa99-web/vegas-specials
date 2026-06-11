import pg from "pg";
const KEY = process.env.GOOGLE_PLACES_API_KEY;
if (!KEY) { console.error("GOOGLE_PLACES_API_KEY required"); process.exit(1); }
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const PL = { PRICE_LEVEL_FREE:0, PRICE_LEVEL_INEXPENSIVE:1, PRICE_LEVEL_MODERATE:2, PRICE_LEVEL_EXPENSIVE:3, PRICE_LEVEL_VERY_EXPENSIVE:4 };
const DETAIL_MASK = "id,location,rating,priceLevel,photos,regularOpeningHours,nationalPhoneNumber,websiteUri";

async function details(placeId) {
  const r = await fetch(`https://places.googleapis.com/v1/places/${placeId}`, { headers: { "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": DETAIL_MASK } });
  return r.ok ? r.json() : null;
}
async function findPlace(name, addr) {
  const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST", headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": "places.id,places.location,places.rating,places.priceLevel,places.photos,places.regularOpeningHours,places.nationalPhoneNumber,places.websiteUri" },
    body: JSON.stringify({ textQuery: `${name} ${addr||"Las Vegas NV"}`, pageSize: 1 }) });
  const j = await r.json(); return (j.places||[])[0] || null;
}
async function enrichVenue(v) {
  try {
    let p = v.google_place_id ? await details(v.google_place_id) : await findPlace(v.name, v.address);
    if (!p) return 0;
    await pool.query(
      `UPDATE venues SET lat=COALESCE($2,lat), lng=COALESCE($3,lng), rating=$4, price_level=$5, photo_ref=$6, hours=$7, phone=$8, website=COALESCE($9,website), google_place_id=COALESCE(google_place_id,$10) WHERE id=$1`,
      [v.id, p.location?.latitude, p.location?.longitude, p.rating||null, (p.priceLevel in PL?PL[p.priceLevel]:null), p.photos?.[0]?.name||null, p.regularOpeningHours?JSON.stringify(p.regularOpeningHours):null, p.nationalPhoneNumber||null, p.websiteUri||null, p.id||null]);
    return 1;
  } catch { return 0; }
}
async function main() {
  const onlyMissing = process.env.ALL ? "" : "WHERE rating IS NULL OR lat IS NULL";
  const { rows } = await pool.query(`SELECT id,name,address,google_place_id FROM venues ${onlyMissing}`);
  console.log("enriching", rows.length, "venues");
  let ok = 0;
  for (let i = 0; i < rows.length; i += 6) {
    const res = await Promise.all(rows.slice(i, i+6).map(enrichVenue));
    ok += res.reduce((a,b)=>a+b,0);
  }
  console.log("enriched", ok, "venues");
  await pool.end();
}
main().catch((e)=>{console.error(e);process.exit(1);});
