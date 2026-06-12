import Link from "next/link";
import { getUpcomingEvents, eventCategoryCounts } from "@/lib/events";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "What's On in Las Vegas — Shows, Concerts, Sports & Comedy | VegasSpecials",
  description: "Every upcoming Las Vegas show, concert, residency, sporting event and comedy night — dates, venues, and ticket prices, updated daily.",
};

const CATS: [string, string][] = [["all", "All"], ["concert", "Concerts"], ["show", "Shows"], ["comedy", "Comedy"], ["sports", "Sports"]];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/Los_Angeles" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Los_Angeles" });
}

export default async function Events({ searchParams }: { searchParams: { cat?: string } }) {
  const cat = searchParams?.cat && searchParams.cat !== "all" ? searchParams.cat : undefined;
  const [events, counts] = await Promise.all([getUpcomingEvents({ category: cat, limit: 200 }), eventCategoryCounts()]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/" className="loc" style={{ textDecoration: "none" }}>&larr; Deals</Link>
      </div></div>

      <div className="wrap">
        <div className="land-head">
          <h1>What&apos;s on in Las Vegas</h1>
          <p className="land-intro">Upcoming shows, concerts, residencies, sports and comedy — with dates, venues and ticket prices. Updated daily.</p>
          <div className="land-fresh"><span className="live-dot" /> {total} upcoming events</div>
        </div>

        <div className="bar" style={{ position: "static", background: "transparent", border: "none", marginBottom: 4 }}>
          <div className="chips" style={{ padding: "0 0 6px" }}>
            {CATS.map(([c, label]) => (
              <Link key={c} href={c === "all" ? "/events" : `/events?cat=${c}`} className={`chip ${(cat || "all") === c ? "on" : ""}`}>
                {label}{c !== "all" && counts[c] ? ` · ${counts[c]}` : ""}
              </Link>
            ))}
          </div>
        </div>

        <div className="list">
          {events.length === 0 && <div className="empty"><b>No events loaded yet</b>Once the Ticketmaster &amp; SeatGeek keys are connected, this fills automatically. <Link href="/">Browse deals</Link></div>}
          {events.map((e) => (
            <a key={e.id} href={e.url || "#"} target="_blank" rel="noopener" className="card" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <div className="c-name" style={{ fontSize: 16 }}>{e.name}</div>
                {e.price_min != null && <span className="vp-price">from ${Math.round(e.price_min)}</span>}
              </div>
              <div className="c-type" style={{ marginTop: 3 }}>{e.venue_name}</div>
              <div className="tags" style={{ marginTop: 8 }}>
                <span className="t">{fmtDate(e.starts_at)} · {fmtTime(e.starts_at)}</span>
                {e.category && e.category !== "other" && <span className="t drink" style={{ textTransform: "capitalize" }}>{e.category}</span>}
              </div>
            </a>
          ))}
        </div>
      </div>

      <nav className="tabbar"><div className="tabbar-inner">
        <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
        <Link href="/map" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>Map</Link>
        <Link href="/events" className="tab active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/></svg>Events</Link>
        <Link href="/best" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Guides</Link>
      </div></nav>
    </>
  );
}
