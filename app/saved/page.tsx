"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Saved() {
  const [ids, setIds] = useState<Record<string, any>>({});
  const [venues, setVenues] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    let s: any = {}; try { s = JSON.parse(localStorage.getItem("vs_saved") || "{}"); } catch {}
    setIds(s);
    fetch("/api/venues").then((r) => r.json()).then((d) => { setVenues((d.venues || []).filter((v: any) => s[v.id])); setLoaded(true); }).catch(() => setLoaded(true));
  }, []);
  const savedIds = Object.keys(ids);
  function remove(id: string) { const n = { ...ids }; delete n[id]; localStorage.setItem("vs_saved", JSON.stringify(n)); setIds(n); setVenues((vs) => vs.filter((v) => v.id !== id)); }

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <span className="loc">Your saved spots</span>
      </div></div>
      <div className="wrap">
        <div className="bloghero" style={{ padding: "18px 2px 6px" }}><h1 style={{ fontSize: 24 }}>Saved spots</h1><p style={{ marginTop: 6 }}>Plan your night at home, then it's all here when you land. Saved on this device.</p></div>
        {loaded && savedIds.length === 0 && (
          <div className="empty"><b>Nothing saved yet</b>Tap the heart on any venue to build your Vegas hit list. <Link href="/">Browse deals</Link></div>
        )}
        <div className="list" style={{ marginTop: 14 }}>
          {venues.map((v) => (
            <div key={v.id} className="card" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <Link href={`/venue/${v.id}`} className="c-name" style={{ fontSize: 16 }}>{v.name}</Link>
                <button className="savebtn on compact" onClick={() => remove(v.id)} aria-label="Remove"><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z"/></svg></button>
              </div>
              <div className="c-type">{v.rating ? `★ ${v.rating} · ` : ""}{v.neighborhood} · {v.deal_count} deal{v.deal_count == 1 ? "" : "s"}</div>
              {v.specials?.[0] && <div className="c-summary" style={{ marginTop: 8 }}>{v.specials[0].summary}</div>}
              <Link href={`/venue/${v.id}`} className="morelink">View all specials →</Link>
            </div>
          ))}
        </div>
      </div>
      <nav className="tabbar"><div className="tabbar-inner">
        <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
        <Link href="/map" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>Map</Link>
        <Link href="/blog" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Blog</Link>
        <Link href="/saved" className="tab active"><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z"/></svg>Saved</Link>
      </div></nav>
    </>
  );
}
