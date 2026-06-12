import Link from "next/link";
import { searchAll } from "@/lib/search";
import SearchBox from "@/components/SearchBox";

export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q || "").trim();
  return { title: q ? `“${q}” — Las Vegas search | VegasSpecials` : "Search Las Vegas deals & events | VegasSpecials", robots: { index: false, follow: true } };
}

function evDate(iso: string) { return new Date(iso).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "America/Los_Angeles" }); }

export default async function Search({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q || "").trim();
  const { venues, deals, events } = q.length >= 2 ? await searchAll(q) : { venues: [], deals: [], events: [] };
  const total = venues.length + deals.length + events.length;

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/" className="loc" style={{ textDecoration: "none" }}>&larr; Deals</Link>
      </div></div>

      <div className="wrap">
        <div style={{ margin: "6px 0 16px" }}><SearchBox initial={q} autoFocus={!q} /></div>

        {q.length < 2 ? (
          <div className="empty"><b>Search all of Vegas</b>Try a venue, a drink, a neighborhood, or a show.</div>
        ) : total === 0 ? (
          <div className="empty"><b>No matches for “{q}”</b>Try fewer or different words. <Link href="/submit">Add a deal we&apos;re missing</Link>.</div>
        ) : (
          <>
            <div className="count"><span className="live-dot" /><span><b>{total}</b> results for “{q}”</span></div>

            {deals.length > 0 && <>
              <h2 style={{ fontSize: 17, margin: "10px 0 10px" }}>Deals</h2>
              <div className="list">
                {deals.map((d) => (
                  <Link key={d.id} href={`/venue/${d.venue_id}`} className="card" style={{ display: "block" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                      <div className="c-name" style={{ fontSize: 15 }}>{d.venue}</div>
                      {d.price != null && <span className="vp-price">${Math.round(d.price)}</span>}
                    </div>
                    <div className="c-summary" style={{ margin: "6px 0 4px" }}>{d.summary}</div>
                    <div className="c-type">{d.neighborhood}{d.days ? ` · ${d.days}` : ""}{d.start_time && d.start_time !== "TBD" ? ` ${d.start_time}` : ""}</div>
                  </Link>
                ))}
              </div>
            </>}

            {venues.length > 0 && <>
              <h2 style={{ fontSize: 17, margin: "22px 0 10px" }}>Venues</h2>
              <div className="list">
                {venues.map((v) => (
                  <Link key={v.id} href={`/venue/${v.id}`} className="card" style={{ display: "block" }}>
                    <div className="c-name" style={{ fontSize: 15 }}>{v.name}</div>
                    <div className="c-type" style={{ marginTop: 3 }}>{v.rating ? `★ ${v.rating} · ` : ""}{v.neighborhood}{v.cuisine ? ` · ${v.cuisine}` : ""}{Number(v.deal_count) > 0 ? ` · ${v.deal_count} live deal${Number(v.deal_count) === 1 ? "" : "s"}` : ""}</div>
                  </Link>
                ))}
              </div>
            </>}

            {events.length > 0 && <>
              <h2 style={{ fontSize: 17, margin: "22px 0 10px" }}>Events</h2>
              <div className="list">
                {events.map((e) => (
                  <a key={e.id} href={e.url || "#"} target="_blank" rel="noopener" className="card" style={{ display: "block" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                      <div className="c-name" style={{ fontSize: 15 }}>{e.name}</div>
                      {e.price_min != null && <span className="vp-price">from ${Math.round(e.price_min)}</span>}
                    </div>
                    <div className="c-type" style={{ marginTop: 3 }}>{e.venue_name} · {evDate(e.starts_at)}</div>
                  </a>
                ))}
              </div>
            </>}
          </>
        )}
      </div>

      <nav className="tabbar"><div className="tabbar-inner">
        <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
        <Link href="/search" className="tab active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>Search</Link>
        <Link href="/price" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Prices</Link>
        <Link href="/best" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Guides</Link>
      </div></nav>
    </>
  );
}
