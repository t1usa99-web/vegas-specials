// One-shot full data refresh: discovery -> deal scrape -> menu scrape.
// Designed to run in the isolated scraper-cron container (not the web service).
// Each step runs as a child process; a failure in one step won't stop the others.
import { execFileSync } from "node:child_process";

const env = {
  ...process.env,
  DISCOVER_PAGES: process.env.DISCOVER_PAGES || "3",
  SCRAPE_CONC: process.env.SCRAPE_CONC || "4",
  SCRAPE_DELAY_MS: process.env.SCRAPE_DELAY_MS || "500",
  MENU_CONC: process.env.MENU_CONC || "4",
  MENU_DELAY_MS: process.env.MENU_DELAY_MS || "500",
};

const steps = [
  ["db/discover.mjs", {}],
  ["db/scrape.mjs", process.env.FORCE_REPARSE ? { FORCE_REPARSE: "1" } : {}],
  ["db/menus.mjs", {}],
  ["db/dishes.mjs", {}],
  ["db/dedupe.mjs", { DEDUPE_COMMIT: "1" }],
  ["db/resort-link.mjs", { RESORT_LINK_COMMIT: "1" }],
  ["db/healthcheck.mjs", {}],
];

for (const [file, extra] of steps) {
  console.log(`\n=== refresh: ${file} @ ${new Date().toISOString()} ===`);
  try { execFileSync("node", [file], { stdio: "inherit", env: { ...env, ...extra } }); }
  catch { console.error(`!! step failed (continuing): ${file}`); }
}
console.log(`\n=== refresh complete @ ${new Date().toISOString()} ===`);
