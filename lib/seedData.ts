// Seed data — the 10 real venues researched for the prototype.
// Used to populate Postgres (db/seed.mjs) AND as a fallback when no DB is attached.
export type Special = {
  venue_id: string; venue: string; type: string; neighborhood: string;
  walk_min: number; category: string; summary: string;
  food: boolean; drink: boolean; freebie: boolean;
  days: string; start_time: string; end_time: string;
  fine_print: string; source: string; confidence: number;
  status: string; last_verified_at: string;
  source_url?: string | null; verified_count?: number | null; last_seen_at?: string | null;
};

const ago = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

export const SEED: Special[] = [
  { venue_id: "v_herbsrye", venue: "Herbs & Rye", type: "Steakhouse / Cocktail Bar", neighborhood: "West of Strip", walk_min: 12, category: "happy_hour", summary: "50% off entire menu — cocktails, wine, beer, apps, oysters, steaks", food: true, drink: true, freebie: false, days: "Daily", start_time: "5:00 PM", end_time: "8:00 PM", fine_print: "Also late-night 11:59 PM–3 AM", source: "venue", confidence: 90, status: "live", last_verified_at: ago(2) },
  { venue_id: "v_ellisisland", venue: "Ellis Island Casino & Brewery", type: "Casino Brewpub", neighborhood: "Off-Strip (East)", walk_min: 18, category: "happy_hour", summary: "$7 bites & drinks; free beer for vets daily; $9.99 steak 24/7", food: true, drink: true, freebie: true, days: "Mon–Fri", start_time: "3:00 PM", end_time: "6:00 PM", fine_print: "Some specials need players card", source: "venue", confidence: 85, status: "live", last_verified_at: ago(1) },
  { venue_id: "v_oysterbar", venue: "The Oyster Bar at Palace Station", type: "Seafood / Oyster Bar", neighborhood: "Off-Strip (West)", walk_min: 22, category: "happy_hour", summary: "$1 oysters happy hour; open 24/7", food: true, drink: false, freebie: false, days: "Daily", start_time: "Open 24/7", end_time: "Open 24/7", fine_print: "Pricing may vary", source: "aggregator", confidence: 75, status: "live", last_verified_at: ago(2) },
  { venue_id: "v_yardbird", venue: "Yardbird Southern Table & Bar", type: "Southern / American", neighborhood: "Strip", walk_min: 6, category: "happy_hour", summary: "$5 draft, $6 wine, $7 bourbon cocktails, $5 deviled eggs, $6 biscuits", food: true, drink: true, freebie: false, days: "Mon–Fri", start_time: "3:00 PM", end_time: "5:30 PM", fine_print: "Bar 2–6 PM & 9 PM–close", source: "venue", confidence: 88, status: "live", last_verified_at: ago(1) },
  { venue_id: "v_beerhaus", venue: "Beerhaus", type: "Beer Hall / Burgers", neighborhood: "Strip", walk_min: 9, category: "happy_hour", summary: "$9.99 burger & fries (+$4.99 draft), $4–5 drafts, $6 pretzels", food: true, drink: true, freebie: false, days: "Mon–Thu", start_time: "2:00 PM", end_time: "5:00 PM", fine_print: "20+ beers on tap", source: "aggregator", confidence: 80, status: "live", last_verified_at: ago(3) },
  { venue_id: "v_hexx", venue: "HEXX Kitchen & Bar", type: "American / Gastropub", neighborhood: "Strip", walk_min: 7, category: "happy_hour", summary: "$4–6 beer, $7+ cocktails & wine, 20% off apps — Strip-view patio", food: true, drink: true, freebie: false, days: "Daily", start_time: "2:00 PM", end_time: "6:00 PM", fine_print: "", source: "aggregator", confidence: 75, status: "live", last_verified_at: ago(3) },
  { venue_id: "v_sakerok", venue: "Sake Rok", type: "Japanese / Izakaya", neighborhood: "Strip", walk_min: 10, category: "happy_hour", summary: "2-for-1 drafts, wells & daiquiris; Sun 6–11 PM half off sake & apps", food: true, drink: true, freebie: false, days: "Daily", start_time: "3:00 PM", end_time: "6:00 PM", fine_print: "", source: "aggregator", confidence: 72, status: "live", last_verified_at: ago(4) },
  { venue_id: "v_carson", venue: "Carson Kitchen", type: "Gastropub / New American", neighborhood: "Downtown", walk_min: 25, category: "happy_hour", summary: "$3–7 drinks, $5–8 appetizers (bar only)", food: true, drink: true, freebie: false, days: "Mon–Fri", start_time: "3:00 PM", end_time: "5:00 PM", fine_print: "Time unconfirmed — a source lists 4–6 PM", source: "aggregator", confidence: 70, status: "live", last_verified_at: ago(2) },
  { venue_id: "v_parkfremont", venue: "Park on Fremont", type: "Bar / Gastropub", neighborhood: "Downtown", walk_min: 26, category: "happy_hour", summary: "Discounted beers, well cocktails & food on a dog-friendly patio", food: true, drink: true, freebie: false, days: "TBD", start_time: "TBD", end_time: "TBD", fine_print: "Times not confirmed — needs verification", source: "aggregator", confidence: 40, status: "unverified", last_verified_at: ago(2) },
  { venue_id: "v_ichiza", venue: "Ichiza", type: "Japanese Izakaya", neighborhood: "Chinatown", walk_min: 20, category: "happy_hour", summary: "Food & drink specials; cult-favorite late-night izakaya to ~2:30 AM", food: true, drink: true, freebie: false, days: "Tue–Sun", start_time: "3:00 PM", end_time: "6:00 PM", fine_print: "", source: "aggregator", confidence: 68, status: "live", last_verified_at: ago(5) },
];
