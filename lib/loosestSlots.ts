// Loosest slots in Las Vegas — official Nevada Gaming Control Board data (2025
// reporting year). "Payback" = 100% minus the casino win/hold %. NGCB reports by
// AREA, not individual casino. Sourced from NGCB monthly revenue reports
// (gaming.nv.gov), cross-checked against published 2025 analyses. Update yearly.
export const DATA_YEAR = "2025";

export type AreaRow = { area: string; payback: number; pennyPayback: number; vegas: boolean; note?: string };
// Payback %, all denominations + penny-only. Higher = looser = better for players.
export const AREAS: AreaRow[] = [
  { area: "Boulder Strip (Henderson/East)", payback: 93.52, pennyPayback: 91.28, vegas: true, note: "Loosest in metro Vegas" },
  { area: "North Las Vegas", payback: 92.53, pennyPayback: 91.29, vegas: true },
  { area: "The Strip", payback: 92.17, pennyPayback: 89.21, vegas: true },
  { area: "Downtown / Fremont", payback: 91.70, pennyPayback: 89.05, vegas: true, note: "Tighter than the Strip — 6 years running" },
  { area: "Laughlin", payback: 91.20, pennyPayback: 89.00, vegas: false },
  { area: "Reno", payback: 94.53, pennyPayback: 93.11, vegas: false, note: "Loosest in Nevada (reference)" },
];

export type DenomRow = { denom: string; payback: number; approx?: boolean };
// Statewide payback by denomination. Penny & quarter are exact 2025 NGCB; higher
// denominations are the published general trend (looser as denomination rises).
export const DENOMS: DenomRow[] = [
  { denom: "1¢ (Penny)", payback: 90.91 },
  { denom: "25¢ (Quarter)", payback: 92.42 },
  { denom: "$1", payback: 94.5, approx: true },
  { denom: "$5", payback: 95.5, approx: true },
  { denom: "$25+", payback: 96.5, approx: true },
];

// Casinos that sit in the looser reporting zones (per NGCB area groupings).
export const LOOSE_ZONES: { zone: string; payback: number; casinos: string[] }[] = [
  { zone: "Boulder Strip", payback: 93.52, casinos: ["Sam's Town", "Boulder Station", "Sunset Station", "Green Valley Ranch", "M Resort", "Arizona Charlie's Boulder"] },
  { zone: "North Las Vegas", payback: 92.53, casinos: ["Aliante", "Cannery", "Jerry's Nugget", "Santa Fe Station"] },
];
