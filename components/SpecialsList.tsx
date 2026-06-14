"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Special } from "@/lib/seedData";
import { verifyLabel } from "@/lib/trust";
import { dealValue } from "@/lib/value";
import Link from "next/link";
import SaveButton from "./SaveButton";
import ConfirmFlag from "./ConfirmFlag";

type Sub = "all" | "now" | "food" | "drink" | "freebie";

const ICON = {
  walk: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="13" cy="4" r="2"/><path d="M7 21l3-6 3 2 1 4M10 9l3-1 3 3 2 1M9 13l-2 3"/></svg>,
  shield: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 3l7 3v5c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12l4 4 10-10"/></svg>,
  info: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>,
  camera: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8a2 2 0 012-2h2l1.5-2h7L17 6h2a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><circle cx="12" cy="12.5" r="3.2"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>,
  glass: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h14l-7 8z"/><path d="M12 12v6M8 20h8"/></svg>,
};

const CATS: { key: string; label: string; live: boolean; href?: string; icon: JSX.Element }[] = [
  { key: "happy_hour", label: "Happy Hour", live: true, icon: ICON.glass },
  { key: "prices", label: "Prices", live: true, href: "/price", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { key: "pools", label: "Pools", live: true, href: "/best/pool-and-dayclub-deals-las-vegas", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg> },
  { key: "gaming", label: "Gaming", live: true, href: "/best/gaming-bar-happy-hours-las-vegas", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.1" fill="currentColor"/><circle cx="15" cy="15" r="1.1" fill="currentColor"/><circle cx="15" cy="9" r="1.1" fill="currentColor"/><circle cx="9" cy="15" r="1.1" fill="currentColor"/></svg> },
];

const GRADS = [
  "linear-gradient(135deg,#7c3aed,#a855f7)",
  "linear-gradient(135deg,#e0356e,#f76aa0)",
  "linear-gradient(135deg,#0f8a5f,#34d399)",
  "linear-gradient(135deg,#2563eb,#60a5fa)",
  "linear-gradient(135deg,#ea580c,#fb923c)",
  "linear-gradient(135deg,#0891b2,#22d3ee)",
];
const STOP = new Set(["the", "at", "and", "a", "of", "&"]);
function initials(name: string) {
  const words = name.replace(/&/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w.toLowerCase()));
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return (words[0] || name).slice(0, 2).toUpperCase();
}
function gradOf(id: string) { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997; return GRADS[h % GRADS.length]; }

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
const sep = " · ";

export default function SpecialsList({ initial }: { initial: Special[] }) {
  const [items, setItems] = useState<(Special & { _fresh?: boolean })[]>(initial);
  const [cat, setCat] = useState("happy_hour");
  const [sub, setSub] = useState<Sub>("all");
  const [q, setQ] = useState("");
  const router = useRouter();
  const [sortBy, setSortBy] = useState<"relevance" | "time">("relevance");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const activeCat = CATS.find((c) => c.key === cat)!;
  const withOpen = useMemo(() => items.map((s) => ({ s, open: isOpenNow(s) })), [items]);
  const openCount = withOpen.filter((x) => x.open === true).length;
  const shown = useMemo(() => {
    let rows = withOpen.filter(({ s, open }) => {
      if (q) { const hay = (s.venue + " " + s.summary + " " + s.neighborhood + " " + s.type).toLowerCase(); if (!hay.includes(q.toLowerCase())) return false; }
      if (sub === "all") return true;
      if (sub === "now") return open === true;
      return (s as any)[sub];
    });
    if (sortBy === "time") {
      const k = (s: Special) => { const t = parseTime(s.start_time); return t === "always" ? 0 : (t === null ? 1e9 : t); };
      rows = [...rows].sort((a, b) => k(a.s) - k(b.s));
    }
    return rows;
  }, [withOpen, sub, q, sortBy]);

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

  const subs: [Sub, string][] = [["all", "All"], ["now", "Open now"], ["food", "Food"], ["drink", "Drink"], ["freebie", "Freebies"]];

  return (
    <>
      <div className="search">
        <div className="box">{ICON.search}
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && q.trim().length >= 2) router.push(`/search?q=${encodeURIComponent(q.trim())}`); }} placeholder="Search venues, deals, neighborhoods… (Enter for all)" />
        </div>
      </div>

      <div className="catnav">
        <div className="row">
          {CATS.map((c) => (
            c.href ? (
              <Link key={c.key} href={c.href} className="cat" style={{ textDecoration: "none" }}>
                <div className="ic">{c.icon}</div>
                <span className="lbl">{c.label}</span>
              </Link>
            ) : (
              <div key={c.key} className={`cat ${cat === c.key ? "active" : ""} ${c.live ? "" : "soon"}`} onClick={() => { setCat(c.key); setSub("all"); }}>
                <div className="ic">{c.icon}</div>
                <span className="lbl">{c.label}</span>
                {!c.live && <span className="soonbadge">soon</span>}
              </div>
            )
          ))}
        </div>
      </div>

      {!activeCat.live ? (
        <div className="wrap">
          <div className="soonpanel">
            <div className="big">{activeCat.icon}</div>
            <b>{activeCat.label} is coming soon</b>
            <p>We&apos;re building out {activeCat.label.toLowerCase()} next &mdash; same freshness and verified pricing you see in Happy Hour. Check back shortly.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="subfilters">
            <div className="chips">
              {subs.map(([f, label]) => (
                <button key={f} className={`chip ${f === "now" ? "now" : ""} ${sub === f ? "on" : ""}`} onClick={() => setSub(f)}>
                  {label}{f === "now" && openCount ? ` (${openCount})` : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="wrap">
            <div className="countrow">
            <div className="count"><span className="live-dot" /><span><b>{shown.length}</b> {sub === "now" ? "open right now" : "happy hours"} near you</span></div>
            <button className="sortbtn" onClick={() => setSortBy(sortBy === "time" ? "relevance" : "time")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              {sortBy === "time" ? "By start time" : "Sort by time"}
            </button>
          </div>
            <div className="list">
              {shown.length === 0 && (
                <div className="empty"><b>Nothing matches yet</b>Try a different filter or search. <a onClick={() => { setSub("all"); setQ(""); }}>Reset</a></div>
              )}
              {shown.map(({ s, open }, i) => {
                const timing = s.days + sep + s.start_time + (s.end_time && s.end_time !== s.start_time ? "–" + s.end_time : "");
                return (
                  <Link key={i} href={`/venue/${s.venue_id}`} className={`card ${s._fresh ? "fresh" : ""}`}>
                    <div className="thumb" style={{ background: gradOf(s.venue_id) }}>
                      <span className="ini">{initials(s.venue)}</span>
                      <span className="catic">{ICON.glass}</span>
                    </div>
                    <div className="cbody">
                      <div className="c-top">
                        <div><div className="c-name">{s.venue}</div><div className="c-type">{s.type}</div></div>
                        <div className="walk"><span className="min">{ICON.walk}{s.walk_min} min</span><span className="hood">{s.neighborhood}</span></div>
                      </div>
                      <p className="c-summary">{s.summary}</p>
                      <div className="tags">
                        <span className="t" style={{ background: "var(--accent-bg)", color: "var(--accent-ink)", fontWeight: 700 }}>{dealValue(s)}</span>
                        {s.food && <span className="t food">Food</span>}
                        {s.drink && <span className="t drink">Drink</span>}
                        {s.freebie && <span className="t free">Freebie</span>}
                        <span className="t">{timing}</span>
                        {(s as any).reverse_window && <span className="t" style={{ background: "#f3eaff", color: "#7a3bb0" }}>Late: {(s as any).reverse_window}</span>}
                      </div>
                      <div className="c-foot">
                        <span className={`trust ${confClass(s.confidence)}`}>{ICON.shield}{s.confidence}</span>
                        {(() => { const vl = verifyLabel(s); return <span className={"verified " + vl.cls}>{ICON.check}{vl.text}</span>; })()}
                        {open === true && <span className="opennow"><span className="blink" />Open now</span>}
                        <span style={{ marginLeft: open === true ? "8px" : "auto" }}><SaveButton id={s.venue_id} name={s.venue} compact /></span>
                      </div>
                      <div style={{ display: "flex", marginTop: 8 }}><ConfirmFlag id={s.id} verified={(s as any).verified_count || 0} /></div>
                      {s.fine_print && <div className="fineprint">{ICON.info}<span>{s.fine_print}</span></div>}
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="addwrap">
              <button className="addbtn" onClick={addPhoto} disabled={busy}>{ICON.camera}{busy ? "Reading photo..." : "Add a special from a photo"}</button>
            </div>
            {toast && <div className="toast">{toast}</div>}
          </div>
        </>
      )}
    </>
  );
}
