import Link from "next/link";
import { LANDINGS } from "@/lib/landing";
export const dynamic = "force-dynamic";
export const metadata = { title: "Las Vegas Deal Guides — Happy Hours, Cheap Drinks & Eats | VegasSpecials", description: "Curated, always-updated guides to the best Las Vegas happy hours, cheap drinks, food specials and freebies." };
export default function BestHub() {
  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/" className="loc" style={{ textDecoration: "none" }}>&larr; Deals</Link>
      </div></div>
      <div className="wrap">
        <div className="land-head"><h1>Las Vegas deal guides</h1><p className="land-intro">Hand-picked categories, each updated automatically as new verified deals come in.</p></div>
        <div className="list">
          <Link href="/open-now" className="card" style={{ display: "block", borderColor: "var(--green)" }}>
            <div className="c-name" style={{ fontSize: 16 }}>🟢 Happy hours open right now</div>
            <div className="c-type" style={{ marginTop: 4 }}>Live list of deals you can walk into this minute, checked against current Las Vegas time.</div>
          </Link>
          <Link href="/resort" className="card" style={{ display: "block" }}>
            <div className="c-name" style={{ fontSize: 16 }}>Happy hours by resort</div>
            <div className="c-type" style={{ marginTop: 4 }}>Every property's deals in one place — ARIA, Bellagio, Caesars, MGM Resorts, Station Casinos and more.</div>
          </Link>
          <Link href="/resort-fees" className="card" style={{ display: "block" }}>
            <div className="c-name" style={{ fontSize: 16 }}>🏨 Resort fees & parking by hotel</div>
            <div className="c-type" style={{ marginTop: 4 }}>Sortable table of every hotel's resort fee and parking cost — who has free parking, who has no resort fee.</div>
          </Link>
          <Link href="/loosest-slots" className="card" style={{ display: "block" }}>
            <div className="c-name" style={{ fontSize: 16 }}>🎰 Loosest slots in Las Vegas</div>
            <div className="c-type" style={{ marginTop: 4 }}>Official Nevada Gaming Control Board payback data — which areas and denominations actually pay back the most.</div>
          </Link>
          {LANDINGS.map((l) => (
            <Link key={l.slug} href={`/best/${l.slug}`} className="card" style={{ display: "block" }}>
              <div className="c-name" style={{ fontSize: 16 }}>{l.h1}</div>
              <div className="c-type" style={{ marginTop: 4 }}>{l.intro}</div>
            </Link>
          ))}
        </div>
      </div>
      <nav className="tabbar"><div className="tabbar-inner">
        <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
        <Link href="/map" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>Map</Link>
        <Link href="/best" className="tab active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Guides</Link>
        <Link href="/saved" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z"/></svg>Saved</Link>
      </div></nav>
    </>
  );
}
