// Derives a value/price label for a deal so nothing ever renders blank.
// Free for freebies, $X for fixed prices, "from $X" from menu items,
// "50% off" / "2-for-1" for discounts, else a $ pulled from the text.
export function dealValue(s: any): string {
  if (!s) return "Deal";
  const money = (n: number) => `$${n % 1 === 0 ? n : n.toFixed(2)}`;
  if (s.freebie) return "Free";
  const p = s.price != null ? Number(s.price) : null;
  if (p != null && p > 0) return money(p);
  try {
    const items = typeof s.items === "string" ? JSON.parse(s.items) : s.items;
    if (Array.isArray(items)) {
      const prices = items.map((i: any) => Number(i?.price)).filter((n: number) => n > 0);
      if (prices.length) return `from ${money(Math.min(...prices))}`;
    }
  } catch { /* */ }
  const dt = String(s.discount_type || "").toLowerCase();
  if (dt.includes("two_for_one") || dt.includes("bogo")) return "2-for-1";
  const pct = String(s.summary || "").match(/(\d{1,3})\s*%/);
  if (pct) return `${pct[1]}% off`;
  if (dt.includes("percent")) return "% off";
  if (dt.includes("free") || dt.includes("comp")) return "Free";
  const dollar = String(s.summary || "").match(/\$\s?(\d+(?:\.\d{1,2})?)/);
  if (dollar) return `$${dollar[1]}`;
  return "Deal";
}
