"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { PriceRow } from "@/lib/price";

type Sort = "price" | "price_desc" | "distance" | "recent";

function miles(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 3958.8, dLat = (bLat - aLat) * Math.PI / 180, dLng = (bLng - aLng) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}
function daysAgo(iso: string | null) {
  if (!iso) return "";
  const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : `${d}d ago`;
}

export default function PriceTable({ rows }: { rows: PriceRow[] }) {
  const [sort, setSort] = useState<Sort>("price");
  const [geo, setGeo] = useState<{ lat: number; lng: number } | null>(null);
  const [geoErr, setGeoErr] = useState("");

  function askGeo() {
    if (!navigator.geolocation) { setGeoErr("Location not available"); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => { setGeo({ lat: p.coords.latitude, lng: p.coords.longitude }); setSort("distance"); },
      () => setGeoErr("Couldn't get your location"),
      { enableHighAccuracy: false, timeout: 8000 });
  }

  const withDist = useMemo(() => rows.map((r) => ({
    r, dist: geo && r.lat != null && r.lng != null ? miles(geo.lat, geo.lng, r.lat, r.lng) : null,
  })), [rows, geo]);

  const sorted = useMemo(() => {
    const a = [...withDist];
    if (sort === "price") a.sort((x, y) => x.r.price - y.r.price);
    else if (sort === "price_desc") a.sort((x, y) => y.r.price - x.r.price);
    else if (sort === "recent") a.sort((x, y) => (new Date(y.r.last_seen_at || 0).getTime()) - (new Date(x.r.last_seen_at || 0).getTime()));
    else if (sort === "distance") a.sort((x, y) => (x.dist ?? 1e9) - (y.dist ?? 1e9));
    return a;
  }, [withDist, sort]);

  const opts: [Sort, string][] = [["price", "Lowest price"], ["price_desc", "Highest price"], ["recent", "Recently verified"]];

  return (
    <>
      <div className="chips" style={{ padding: "0 0 14px", flexWrap: "wrap" }}>
        {opts.map(([s, label]) => (
          <button key={s} className={`chip ${sort === s ? "on" : ""}`} onClick={() => setSort(s)}>{label}</button>
        ))}
        <button className={`chip ${sort === "distance" ? "on" : ""}`} onClick={askGeo}>Closest to me</button>
      </div>
      {geoErr && <div className="count" style={{ color: "var(--accent)" }}>{geoErr}</div>}

      <div className="list">
        {sorted.length === 0 && <div className="empty"><b>No verified prices yet</b>This fills in as the crawler reads more menus. <Link href="/">Browse deals</Link></div>}
        {sorted.map(({ r, dist }, i) => (
          <Link key={r.venue_id} href={`/venue/${r.venue_id}`} className="card" style={{ display: "block" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <div>
                <div className="c-name" style={{ fontSize: 16 }}>{i === 0 && sort === "price" ? "🏆 " : ""}{r.venue}</div>
                <div className="c-type" style={{ marginTop: 2 }}>{r.rating ? `★ ${r.rating} · ` : ""}{r.neighborhood}{dist != null ? ` · ${dist.toFixed(1)} mi` : ""}</div>
              </div>
              <div style={{ textAlign: "right", flex: "0 0 auto" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: "var(--accent)" }}>${r.price % 1 === 0 ? r.price : r.price.toFixed(2)}</div>
                {r.last_seen_at && <div style={{ fontSize: 11, color: "var(--muted)" }}>seen {daysAgo(r.last_seen_at)}</div>}
              </div>
            </div>
            {(r.days || r.start_time) && (
              <div className="tags" style={{ marginTop: 10 }}>
                <span className="t">{r.days}{r.start_time && r.start_time !== "TBD" ? ` · ${r.start_time}${r.end_time && r.end_time !== r.start_time ? `–${r.end_time}` : ""}` : ""}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
