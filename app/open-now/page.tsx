import Link from "next/link";
import { openNowVenues, vegasNow } from "@/lib/openNow";
import Faq from "@/components/Faq";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Happy Hours Open Right Now in Las Vegas | VegasSpecials",
  description: "Live list of Las Vegas happy hours and drink specials that are open right now, this minute — updated in real time using current Las Vegas time.",
};

function clock() {
  return new Date().toLocaleTimeString("en-US", { timeZone: "America/Los_Angeles", hour: "numeric", minute: "2-digit" });
}

export default async function OpenNow() {
  const venues = await openNowVenues();
  const dealCount = venues.reduce((n, v) => n + v.specials.length, 0);
  const faqs = [
    { q: "How do you know which Las Vegas happy hours are open right now?", a: "We check each verified special's days and hours against the current time in Las Vegas (Pacific time) and show only the ones live this minute. The list refreshes every time you load the page." },
    ...(venues.length ? [{ q: "How many happy hours are open in Las Vegas right now?", a: `Right now ${dealCount} verified deal${dealCount === 1 ? "" : "s"} at ${venues.length} venue${venues.length === 1 ? "" : "s"} ${venues.length === 1 ? "is" : "are"} open. Reload any time for the current list.` }] : []),
    { q: "What time does happy hour usually start in Las Vegas?", a: "Most Las Vegas happy hours run 3-7pm Monday through Friday, with a growing number running daily and late-night 'reverse' windows after 10pm. This page only shows the ones open at this exact moment." },
  ];

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/best" className="loc" style={{ textDecoration: "none" }}>All guides</Link>
      </div></div>

      <div className="wrap">
        <div className="land-head">
          <h1>Happy hours open right now in Las Vegas</h1>
          <p className="land-intro">Live deals you can walk into this minute — checked against the current time in Las Vegas.</p>
          <div className="land-fresh"><span className="live-dot" /> {dealCount} deals open · {venues.length} venues · {clock()} in Las Vegas</div>
        </div>

        <div className="list">
          {venues.length === 0 && <div className="empty"><b>Nothing's open this minute</b>Vegas runs late — check back closer to a happy-hour window, or <Link href="/best">browse all guides</Link>.</div>}
          {venues.map((r) => (
            <Link key={r.id} href={`/venue/${r.id}`} className="card" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <div className="c-name" style={{ fontSize: 16 }}>{r.name}</div>
                <span className="opennow" style={{ marginLeft: 0 }}><span className="blink" />Open now</span>
              </div>
              <div className="c-type">{r.rating ? `★ ${r.rating} · ` : ""}{r.neighborhood}{r.cheapest != null ? ` · from $${Math.round(r.cheapest)}` : ""}</div>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {r.specials.slice(0, 3).map((s: any, j: number) => (
                  <div key={j} style={{ fontSize: 13.5, color: "#3d3744" }}>
                    {s.summary}{s.start && s.start !== "TBD" ? <span style={{ color: "var(--muted)" }}> · until {s.end}</span> : null}{s.outlet ? <span style={{ color: "var(--muted)" }}> · {s.outlet}</span> : null}
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <Faq items={faqs} />
      </div>

      <nav className="tabbar"><div className="tabbar-inner">
        <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
        <Link href="/map" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>Map</Link>
        <Link href="/best" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Guides</Link>
        <Link href="/saved" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z"/></svg>Saved</Link>
      </div></nav>
    </>
  );
}
