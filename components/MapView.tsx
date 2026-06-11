"use client";
import { useEffect, useRef, useState } from "react";

type V = { id: string; name: string; neighborhood: string; lat: number; lng: number; rating: number | null; price_level: number | null; walk_min: number | null; cheapest: number | null; deal_count: number; specials: any[] };

export default function MapView() {
  const ref = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    let map: any;
    function load(src: string, css?: boolean) {
      return new Promise<void>((res) => {
        if (css) { const l = document.createElement("link"); l.rel = "stylesheet"; l.href = src; l.onload = () => res(); document.head.appendChild(l); }
        else { const sc = document.createElement("script"); sc.src = src; sc.onload = () => res(); document.head.appendChild(sc); }
      });
    }
    (async () => {
      await load("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", true);
      if (!(window as any).L) await load("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js");
      const L = (window as any).L;
      if (!ref.current || ref.current.dataset.init) return;
      ref.current.dataset.init = "1";
      map = L.map(ref.current, { zoomControl: true }).setView([36.1100, -115.1730], 13);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", { attribution: "&copy; OpenStreetMap &copy; CARTO", maxZoom: 20 }).addTo(map);
      const res = await fetch("/api/venues"); const data = await res.json();
      const vs: V[] = data.venues || []; setCount(vs.length);
      const bounds: any[] = [];
      for (const v of vs) {
        const label = v.cheapest != null ? `$${Math.round(v.cheapest)}` : (v.deal_count > 1 ? `${v.deal_count}` : "•");
        const icon = L.divIcon({ className: "", html: `<div class="pin">${label}</div>`, iconSize: [36, 36], iconAnchor: [18, 18] });
        const m = L.marker([v.lat, v.lng], { icon }).addTo(map);
        const stars = v.rating ? `★ ${v.rating}` : "";
        const deals = (v.specials || []).slice(0, 3).map((s: any) => `<div class="pp-deal">${s.summary || ""}${s.start && s.start !== "TBD" ? ` <span class="pp-t">${s.days || ""} ${s.start}${s.end && s.end !== s.start ? "–" + s.end : ""}</span>` : ""}</div>`).join("");
        const dir = `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`;
        m.bindPopup(`<div class="pp"><div class="pp-h"><b>${v.name}</b> <span class="pp-meta">${stars}${v.neighborhood ? " · " + v.neighborhood : ""}</span></div>${deals}<a class="pp-dir" href="${dir}" target="_blank" rel="noopener">Directions ↗</a></div>`, { maxWidth: 280 });
        bounds.push([v.lat, v.lng]);
      }
      if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
    })();
    return () => { if (map) map.remove(); };
  }, []);

  return (
    <>
      <div className="mapcount">{count} venues with live deals</div>
      <div ref={ref} className="mapbox" />
    </>
  );
}
