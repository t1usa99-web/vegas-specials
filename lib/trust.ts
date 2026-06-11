// Honest, tiered verification label. We only claim "by locals" when a human
// has actually confirmed; otherwise we say the deal was verified via the
// venue's own website (which is where the scraper read it).
export type Verifiable = {
  source?: string | null;
  source_url?: string | null;
  verified_count?: number | null;
  last_seen_at?: string | null;
  last_verified_at?: string | null;
};

function rel(iso?: string | null): string {
  if (!iso) return "";
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  if (isNaN(d)) return "";
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d} days ago`;
}

const HUMAN = /(user|crowd|photo|submission|report)/i;
const WEB = /(firecrawl|scrape|aggregator|venue|official)/i;

export function verifyLabel(s: Verifiable): { text: string; cls: "ok" | "web" } {
  const vc = s.verified_count ?? 0;
  if (vc > 0) {
    const when = rel(s.last_verified_at);
    return { text: `Confirmed by ${vc} visitor${vc > 1 ? "s" : ""}${when ? ` · ${when}` : ""}`, cls: "ok" };
  }
  if (HUMAN.test(s.source || "")) {
    const when = rel(s.last_verified_at || s.last_seen_at);
    return { text: `Submitted by a visitor${when ? ` · ${when}` : ""}`, cls: "web" };
  }
  // Default: read straight from the venue's website / promo page.
  const when = rel(s.last_seen_at || s.last_verified_at);
  return { text: `Verified via website${when ? ` · ${when}` : ""}`, cls: "web" };
}
