"use client";
import { useMemo, useState } from "react";
import type { Special } from "@/lib/seedData";

type Filter = "all" | "now" | "food" | "drink" | "freebie";

const I = {
  walk: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13" cy="4" r="2"/><path d="M7 21l3-6 3 2 1 4M10 9l3-1 3 3 2 1M9 13l-2 3"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4 4 10-10"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>,
  camera: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><circle cx="12" cy="12.5" r="3.2"/></svg>,
};

const DAYI: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

function parseDays(s: string): Set<number> | null {
  if (!s) return null;
  const t = s.toLowerCase();
  if (t.includes("daily") || t.includes("every")) return new Set([0, 1, 2, 3, 4, 5, 6]);
  if (t.includes("tbd")) return null;
  const parts = t.split(/[–—-]/).map((x) => x.trim().slice(0, 3)).filter((x) => x in DAYI);
  if (parts.length === 1) return new Set([DAYI[parts[0]]]);
  if (parts.length >= 2) {
    const a = DAYI[parts[0]], b = DAYI[parts[parts.length - 1]];
    const set = new Set<number>(); let i = a;
    for (let n = 0; n < 7; n++) { set.add(i); if (i === b) break; i = (i + 1) % 7; }
    return set;
  }
  return null;
}
function parseTime(s: string): number | "always" | null {
  if (!s) return null;
  const t = s.toLowerCase();
  if (t.includes("24/7") || t.includes("24 ")) return "always";
  if (t.includes("tbd")) return null;
  const m = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/);
  if (!m) return null;
  let h = parseInt(m[1]); const min = m[2] ? parseInt(m[2]) : 0;
  if (m[3] === "pm" && h !== 12) h += 12;
  if (m[3] === "am" && h === 12) h = 0;
  return h * 60 + min;
}
function vegasNow() {
  const d = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
}
function isOpenNow(s: Special): boolean | null {
  const start = parseTime(s.start_time);
  if (start === "always") return true;
  const days = parseDays(s.days);
  const end = parseTime(s.end_time);
  if (!days || start === null || end === null || typeof start !== "number" || typeof end !== "number") return null;
  const { day, min } = vegasNow();
  if (!days.has(day)) return false;
  return end <= start ? (min >= start || min < end) : (min >= start && min < end);
}
function confClass(c: number) { return c >= 85 ? "hi" : c >= 72 ? "mid" : "lo"; }
function daysAgo(iso: string) {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : d + " days ago";
}

export default function SpecialsList({ initial }: { initial: Special[] }) {
  const [items, setItems] = useState<(Special & { _fresh?: boolean })[]>(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const withOpen = useMemo(() => items.map((s) => ({ s, open: isOpenNow(s) })), [items]);
  const openCount = withOpen.filter((x) => x.open === true).length;
  const shown = useMemo(() => withOpen.filter(({ s, open }) => {
    if (filter === "all") return true;
    if (filter === "now") return open === true;
    return (s as any)[filter];
  }), [withOpen, filter]);

  async function addPhoto() {
    setBusy(true); setToast("");
    try {
      const res = await fetch("/api/extract", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mock: true }) });
      const data = await res.json();
      if (data.status === "ok" && data.rows?.length) {
        const summary = data.rows.map((x: any) => x.price ? `${x.name} $${x.price}` : `${x.name} (half off)`).join(", ");
        const card: Special & { _fresh?: boolean } = {
          venue_id: "v_herbsrye", venue: "Herbs & Rye", type: "Steakhouse / Cocktail Bar", neighborhood: "West of Strip",
          walk_min: 12, category: "happy_hour", summary: "Just read from a photo: " + summary,
          food: true, drink: true, freebie: false, days: "Daily", start_time: "5:00 PM", end_time: "8:00 PM",
          fine_print: "Confirmed via on-site photo", source: "user_photo", confidence: data.confidence.score,
          status: "live", last_verified_at: new Date().toISOString(), _fresh: true,
        };
        setItems((prev) => [card, ...prev]);
        setToast(`Photo read by AI: ${data.rows.length} items extracted, confidence ${data.confidence.score}, published automatically.`);
      } else setToast("Couldn't read that image. Try a clearer photo of the menu.");
    } catch { setToast("Extraction service unavailable right now."); }
    finally { setBusy(false); }
  }

  const chips: [Filter, string][] = [["all", "All"], ["now", "Open now"], ["food", "Food"], ["drink", "Drink"], ["freebie", "Freebies"]];

  return (
    <>
      <div className="bar">
        <div className="bar-inner">
          <div className="chips">
            {chips.map(([f, label]) => (
              <button key={f} className={`chip ${f === "now" ? "now" : ""} ${filter === f ? "on" : ""}`} onClick={() => setFilter(f)}>
                {label}{f === "now" && openCount ? ` (${openCount})` : ""}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="count"><span className="live-dot" /><span><b>{shown.length}</b> {filter === "now" ? "open right now" : "specials"} near you</span></div>

        <div className="list">
          {shown.length === 0 && (
            <div className="empty"><b>Nothing matches yet</b>Try a different filter. <a onClick={() => setFilter("all")}>Show all specials</a></div>
          )}
          {shown.map(({ s, open }, i) => {
            const timing = `${s.days} · ${s.start_time}${s.end_time && s.end_time !== s.start_time ? "–" + s.end_time : ""}`;
            return (
            <article key={i} className={`card ${s._fresh ? "fresh" : ""}`}>
              <div className="c-top">
                <div>
                  <div className="c-name">{s.venue}</div>
                  <div className="c-type">{s.type}</div>
                </div>
                <div className="walk">
                  <span className="min">{I.walk}{s.walk_min} min</span>
                  <span className="hood">{s.neighborhood}</span>
                </div>
              </div>

              <p className="c-summary">{s.summary}</p>

              <div className="tags">
                {s.food && <span className="t food">Food</span>}
                {s.drink && <span className="t drink">Drink</span>}
                {s.freebie && <span className="t free">Freebie</span>}
                <span className="t">{timing}</span>
              </div>

              <div className="c-foot">
                <span className={`trust ${confClass(s.confidence)}`}>{I.shield}{s.confidence}</span>
                <span className="verified">{I.check}verified {daysAgo(s.last_verified_at)}</span>
                {open === true && <span className="opennow"><span className="blink" />Open now</span>}
              </div>

              {s.fine_print && (
                <div className="fineprint">{I.info}<span>{s.fine_print}</span></div>
              )}
            </article>
            );
          })}
        </div>

        <div className="addwrap">
          <button className="addbtn" onClick={addPhoto} disabled={busy}>
            {I.camera}{busy ? "Reading photo..." : "Add a special from a photo"}
          </button>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </div>
    </>
  );
}
