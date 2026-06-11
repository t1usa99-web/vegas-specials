import Link from "next/link";
import { RESORTS } from "@/lib/resorts";

export const dynamic = "force-dynamic";
export const metadata = { title: "Las Vegas Resort Happy Hours by Property | VegasSpecials", description: "Every Las Vegas resort's happy hours and restaurant deals, aggregated by property and casino group — ARIA, Bellagio, Caesars, MGM Resorts and more." };

export default function ResortIndex() {
  const props = RESORTS.filter((r) => r.group !== "Resort groups");
  const groups = RESORTS.filter((r) => r.group === "Resort groups");
  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/best" className="loc" style={{ textDecoration: "none" }}>&larr; Guides</Link>
      </div></div>
      <div className="wrap">
        <div className="land-head"><h1>Happy hours by resort</h1><p className="land-intro">Every property's deals in one place — pulled live from all its restaurants and bars, updated as new verified specials come in.</p></div>

        <h2 className="faq-title" style={{ marginTop: 8 }}>Casino groups</h2>
        <div className="list">
          {groups.map((r) => (
            <Link key={r.slug} href={`/resort/${r.slug}`} className="card" style={{ display: "block" }}>
              <div className="c-name" style={{ fontSize: 16 }}>{r.name}</div>
              <div className="c-type" style={{ marginTop: 4 }}>{r.intro}</div>
            </Link>
          ))}
        </div>

        <h2 className="faq-title" style={{ marginTop: 20 }}>Individual resorts</h2>
        <div className="list">
          {props.map((r) => (
            <Link key={r.slug} href={`/resort/${r.slug}`} className="card" style={{ display: "block" }}>
              <div className="c-name" style={{ fontSize: 16 }}>{r.name}</div>
              <div className="c-type" style={{ marginTop: 4 }}>{r.intro}</div>
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
