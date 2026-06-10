"use client";
import { useMemo, useState } from "react";
import type { Special } from "@/lib/seedData";

type Filter = "all" | "food" | "drink" | "freebie";

function confClass(c: number) { return c >= 85 ? "conf hi" : c >= 75 ? "conf mid" : "conf lo"; }
function daysAgo(iso: string) {
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "1d ago" : `${d}d ago`;
}

export default function SpecialsList({ initial }: { initial: Special[] }) {
  const [items, setItems] = useState<Special[]>(initial);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>("");

  const shown = useMemo(() => items.filter((s) => filter === "all" ? true : (s as any)[filter]), [items, filter]);

  async function addPhoto() {
    setBusy(true); setNote("");
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mock: true }),
      });
      const data = await res.json();
      if (data.status === "ok" && data.rows?.length) {
        const r = data.rows[0];
        const card: Special = {
          venue_id: r.venue_id, venue: "Herbs & Rye (photo)", type: "Steakhouse", neighborhood: "West of Strip",
          walk_min: 12, category: r.category,
          summary: data.rows.map((x: any) => x.price ? `${x.name} $${x.price}` : `${x.name} (½ off)`).join(", "),
          food: true, drink: true, freebie: false, days: "Daily", start_time: "5:00 PM", end_time: "8:00 PM",
          fine_print: "", source: r.source, confidence: data.confidence.score, status: "live",
          last_verified_at: new Date().toISOString(),
        };
        setItems((prev) => [{ ...card, _new: true } as any, ...prev]);
        setNote(`Read photo → ${data.rows.length} items · confidence ${data.confidence.score} · ${data.confidence.action}`);
      } else {
        setNote("Could not read that image.");
      }
    } catch (e) {
      setNote("Extract endpoint error.");
    } finally { setBusy(false); }
  }

  return (
    <>
      <div className="head" style={{ marginTop: 0 }}>
        <div className="chips" style={{ marginBottom: 0 }}>
          {(["all", "food", "drink", "freebie"] as Filter[]).map((f) => (
            <button key={f} className={"chip" + (filter === f ? " on" : "")} onClick={() => setFilter(f)}>
              {f[0].toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <button className="btn" onClick={addPhoto} disabled={busy}>
          {busy ? "reading image…" : "📷 Add a photo"}
        </button>
      </div>
      {note && <div className="banner" style={{ marginTop: 12 }}>{note}</div>}
      <div className="list" style={{ marginTop: 14 }}>
        {shown.length === 0 && <div className="empty">Nothing matches — <a onClick={() => setFilter("all")} href="#">show all</a>.</div>}
        {shown.map((s, i) => (
          <div key={i} className={"card" + ((s as any)._new ? " new" : "")}>
            <div className="row1">
              <div className="vname">{s.venue}</div>
              <div className="walk">🚶 {s.walk_min} min</div>
            </div>
            <div className="summary">{s.summary}</div>
            <div className="meta">
              <span className={confClass(s.confidence)}>✓ {s.confidence}</span>
              {s.food && <span className="tag">Food</span>}
              {s.drink && <span className="tag">Drink</span>}
              {s.freebie && <span className="tag free">Freebie</span>}
              <span className="dim">· {s.days} {s.start_time}{s.end_time && s.end_time !== s.start_time ? `–${s.end_time}` : ""} · verified {daysAgo(s.last_verified_at)}</span>
              {s.status === "live" && <span className="tag now">Live</span>}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
