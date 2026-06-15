// Las Vegas buffet prices — current open buffets only (2026). Many Vegas buffets
// closed post-pandemic (Luxor, MGM Grand, Rio and others are gone). Prices are the
// typical per-person rate before tax and are DYNAMIC — expect +$5–15 on holiday/
// event weekends (e.g. F1). Sourced from operator menus + lasvegaswonders.com (May
// 2026). Update when prices move.
export const UPDATED = "June 2026";

export type Buffet = { name: string; hotel: string; area: "Strip" | "Downtown" | "Off-Strip"; brunch: number | null; dinner: number | null; note: string; bestFor: string };

// brunch/dinner = typical weekday "from" price (USD). null = not served.
export const BUFFETS: Buffet[] = [
  { name: "Garden Buffet", hotel: "South Point", area: "Off-Strip", brunch: 20, dinner: 33, note: "Cheaper with a player's card; Fri seafood night ~$58", bestFor: "Best value in town" },
  { name: "Garden Court Buffet", hotel: "Main Street Station", area: "Downtown", brunch: 25, dinner: 34, note: "Dinner Fri/Sat only; Victorian downtown vibe", bestFor: "Downtown value" },
  { name: "The Buffet", hotel: "Excalibur", area: "Strip", brunch: 33, dinner: null, note: "No dinner service; the closest Strip buffet to Luxor (which closed)", bestFor: "Families on a budget" },
  { name: "A.Y.C.E. Buffet", hotel: "Palms", area: "Off-Strip", brunch: 43, dinner: 47, note: "Wed/Thu lobster night ~$80", bestFor: "Lobster night" },
  { name: "The Buffet at Bellagio", hotel: "Bellagio", area: "Strip", brunch: 46, dinner: 79, note: "Weekend brunch higher; book ahead", bestFor: "High-end sushi & seafood" },
  { name: "Wicked Spoon", hotel: "The Cosmopolitan", area: "Strip", brunch: 59, dinner: null, note: "Brunch only — closes 2–4pm, no dinner. Served in individual small plates", bestFor: "Small plates & ramen" },
  { name: "The Buffet at Wynn", hotel: "Wynn", area: "Strip", brunch: 62, dinner: 85, note: "120+ dishes; the most beautiful room and great vegetarian options", bestFor: "Decor & pastries" },
  { name: "Bacchanal Buffet", hotel: "Caesars Palace", area: "Strip", brunch: 65, dinner: 87, note: "Weekend crab brunch ~$95; lobster add-ons push dinner to ~$108", bestFor: "Crab legs & global variety" },
];
