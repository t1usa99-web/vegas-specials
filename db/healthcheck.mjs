// Post-run health check. Hits the live /api/health?full=1 and fails loudly (exit 1)
// if the DB is down or any guide page's filter is broken — the silent-failure class
// (a bad WHERE clause returning 0 with no error) we want to catch before users do.
// Run: node db/healthcheck.mjs   Env: HEALTH_URL
const URL = process.env.HEALTH_URL || "https://web-production-74d6.up.railway.app/api/health?full=1";
try {
  const r = await fetch(URL, { signal: AbortSignal.timeout(20000) });
  const j = await r.json();
  console.log("HEALTH", r.status, JSON.stringify(j));
  const broken = (j.brokenGuides || []);
  if (!j.ok || broken.length) {
    console.error("!! HEALTH CHECK FAILED", broken.length ? "broken guides: " + JSON.stringify(broken) : j.error || "");
    process.exit(1);
  }
  if (j.emptyGuides && j.emptyGuides.length) console.log("note: thin/empty guides (may be expected):", j.emptyGuides.join(", "));
  console.log("health OK ·", JSON.stringify(j.counts));
} catch (e) { console.error("!! HEALTH CHECK could not reach", URL, String(e)); process.exit(1); }
