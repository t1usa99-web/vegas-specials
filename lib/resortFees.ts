// Las Vegas resort & parking fees. Resort fees are the advertised nightly rate
// (before the 13.38% Clark County room tax). Sourced from operator rate sheets +
// lasvegasdirect.com (2026), cross-checked. Parking is shown free vs paid; paid
// self-park at MGM/Caesars is typically $18-25/day, higher at Wynn/Venetian.
// Hardcoded (never user input). Update `UPDATED` when refreshed.
export const UPDATED = "June 2026";

export type Hotel = { hotel: string; area: "Strip" | "Downtown" | "Off-Strip"; group?: string; fee: number; parkFree: boolean; selfPark: number | null; note?: string };

export const HOTELS: Hotel[] = [
  // ---- Strip ----
  { hotel: "ARIA Resort & Casino", area: "Strip", group: "MGM", fee: 55, parkFree: false, selfPark: 21 },
  { hotel: "Bellagio", area: "Strip", group: "MGM", fee: 55, parkFree: false, selfPark: 21 },
  { hotel: "The Cosmopolitan", area: "Strip", group: "MGM", fee: 50, parkFree: false, selfPark: 18 },
  { hotel: "MGM Grand", area: "Strip", group: "MGM", fee: 50, parkFree: false, selfPark: 18 },
  { hotel: "Mandalay Bay", area: "Strip", group: "MGM", fee: 50, parkFree: false, selfPark: 18 },
  { hotel: "Park MGM", area: "Strip", group: "MGM", fee: 50, parkFree: false, selfPark: 18 },
  { hotel: "New York-New York", area: "Strip", group: "MGM", fee: 45, parkFree: false, selfPark: 18 },
  { hotel: "Luxor", area: "Strip", group: "MGM", fee: 45, parkFree: false, selfPark: 15 },
  { hotel: "Excalibur", area: "Strip", group: "MGM", fee: 45, parkFree: false, selfPark: 15 },
  { hotel: "Caesars Palace", area: "Strip", group: "Caesars", fee: 55, parkFree: false, selfPark: 22 },
  { hotel: "Paris Las Vegas", area: "Strip", group: "Caesars", fee: 55, parkFree: false, selfPark: 25 },
  { hotel: "Planet Hollywood", area: "Strip", group: "Caesars", fee: 55, parkFree: false, selfPark: 25 },
  { hotel: "The LINQ", area: "Strip", group: "Caesars", fee: 50, parkFree: false, selfPark: 20 },
  { hotel: "Flamingo", area: "Strip", group: "Caesars", fee: 50, parkFree: false, selfPark: 20 },
  { hotel: "Harrah's Las Vegas", area: "Strip", group: "Caesars", fee: 50, parkFree: false, selfPark: 20 },
  { hotel: "Horseshoe Las Vegas", area: "Strip", group: "Caesars", fee: 50, parkFree: false, selfPark: 20 },
  { hotel: "Wynn Las Vegas", area: "Strip", group: "Wynn", fee: 55, parkFree: false, selfPark: 28 },
  { hotel: "Encore", area: "Strip", group: "Wynn", fee: 55, parkFree: false, selfPark: 28 },
  { hotel: "The Venetian", area: "Strip", fee: 50, parkFree: false, selfPark: 23 },
  { hotel: "The Palazzo", area: "Strip", fee: 50, parkFree: false, selfPark: 23 },
  { hotel: "Resorts World", area: "Strip", fee: 55, parkFree: false, selfPark: 15 },
  { hotel: "Fontainebleau", area: "Strip", fee: 55, parkFree: true, selfPark: 0, note: "Free self-park for guests" },
  { hotel: "SAHARA Las Vegas", area: "Strip", fee: 55, parkFree: true, selfPark: 0, note: "Free self-park" },
  { hotel: "Treasure Island (TI)", area: "Strip", fee: 45, parkFree: true, selfPark: 0, note: "Free self-park" },
  { hotel: "The STRAT", area: "Strip", fee: 40, parkFree: true, selfPark: 0, note: "Free self-park" },
  { hotel: "Four Seasons Las Vegas", area: "Strip", fee: 55, parkFree: false, selfPark: null, note: "Valet only" },
  // ---- Downtown ----
  { hotel: "Circa", area: "Downtown", fee: 50, parkFree: false, selfPark: 18, note: "Adults only (21+)" },
  { hotel: "Golden Nugget", area: "Downtown", fee: 46, parkFree: true, selfPark: 0, note: "Free for guests & players" },
  { hotel: "The D Las Vegas", area: "Downtown", fee: 40, parkFree: true, selfPark: 0 },
  { hotel: "Golden Gate", area: "Downtown", fee: 40, parkFree: true, selfPark: 0 },
  { hotel: "Plaza Hotel & Casino", area: "Downtown", fee: 39, parkFree: true, selfPark: 0 },
  { hotel: "Downtown Grand", area: "Downtown", fee: 39, parkFree: true, selfPark: 0 },
  { hotel: "California Hotel", area: "Downtown", group: "Boyd", fee: 33, parkFree: true, selfPark: 0 },
  { hotel: "Main Street Station", area: "Downtown", group: "Boyd", fee: 33, parkFree: true, selfPark: 0 },
  { hotel: "Fremont Hotel", area: "Downtown", group: "Boyd", fee: 28, parkFree: true, selfPark: 0 },
  { hotel: "El Cortez", area: "Downtown", fee: 26, parkFree: true, selfPark: 0, note: "Adults only (21+)" },
  // ---- Off-Strip / Locals ----
  { hotel: "South Point", area: "Off-Strip", fee: 0, parkFree: true, selfPark: 0, note: "No resort fee + free parking" },
  { hotel: "Ellis Island Casino", area: "Off-Strip", fee: 35, parkFree: true, selfPark: 0, note: "Free self-park" },
  { hotel: "Red Rock Resort", area: "Off-Strip", group: "Station", fee: 45, parkFree: true, selfPark: 0 },
  { hotel: "Durango Casino & Resort", area: "Off-Strip", group: "Station", fee: 45, parkFree: true, selfPark: 0 },
  { hotel: "Green Valley Ranch", area: "Off-Strip", group: "Station", fee: 45, parkFree: true, selfPark: 0 },
  { hotel: "Palace Station", area: "Off-Strip", group: "Station", fee: 40, parkFree: true, selfPark: 0 },
  { hotel: "Boulder Station", area: "Off-Strip", group: "Station", fee: 30, parkFree: true, selfPark: 0 },
  { hotel: "Palms Casino Resort", area: "Off-Strip", fee: 43, parkFree: true, selfPark: 0, note: "Free self-park" },
  { hotel: "Gold Coast", area: "Off-Strip", group: "Boyd", fee: 40, parkFree: true, selfPark: 0 },
  { hotel: "The Orleans", area: "Off-Strip", group: "Boyd", fee: 40, parkFree: true, selfPark: 0 },
  { hotel: "JW Marriott (Rampart)", area: "Off-Strip", fee: 45, parkFree: true, selfPark: 0 },
  { hotel: "Aliante Casino", area: "Off-Strip", fee: 36, parkFree: true, selfPark: 0 },
  { hotel: "Sam's Town", area: "Off-Strip", group: "Boyd", fee: 30, parkFree: true, selfPark: 0 },
  { hotel: "Cannery Casino", area: "Off-Strip", fee: 30, parkFree: true, selfPark: 0 },
];

export const TAX = 0.1338; // Clark County room tax applied to resort fees
