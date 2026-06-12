import Link from "next/link";
import { TRACKED } from "@/lib/price";

export const dynamic = "force-dynamic";
export const metadata = { title: "Las Vegas Price Comparisons — Beer, Drinks & More, Sortable | VegasSpecials", description: "Live, sortable price comparisons across Las Vegas venues: Coors Light, draft beer, well drinks, margaritas, oysters and more. Sort by lowest price or closest to you." };

export default function PriceIndex() {
  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/" className="loc" style={{ textDecoration: "none" }}>&larr; Deals</Link>
      </div></div>
      <div className="wrap">
        <div className="land-head"><h1>What does it cost in Vegas?</h1><p className="land-intro">Live price comparisons across every venue we track — sort by lowest price, highest, or closest to you. The thing no Vegas blog can do.</p></div>
        <div className="list">
          {TRACKED.map((t) => (
            <Link key={t.slug} href={`/price/${t.slug}`} className="card" style={{ display: "block" }}>
              <div className="c-name" style={{ fontSize: 16 }}>{t.label}</div>
              <div className="c-type" style={{ marginTop: 4 }}>{t.h1.replace(" in Las Vegas", "")} — sortable by price &amp; distance</div>
            </Link>
          ))}
        </div>
      </div>
      <nav className="tabbar"><div className="tabbar-inner">
        <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
        <Link href="/map" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>Map</Link>
        <Link href="/price" className="tab active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Prices</Link>
        <Link href="/best" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Guides</Link>
      </div></nav>
    </>
  );
}
