import Link from "next/link";
import { TRACKED } from "@/lib/price";
import { getDishPages } from "@/lib/dishes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Las Vegas Price Comparisons — Beer, Drinks, Food & More, Sortable | VegasSpecials", description: "Live, sortable price comparisons across Las Vegas venues: beer, well drinks, margaritas, steak, burgers, oysters and every dish we can find. Sort by lowest price or closest to you." };

export default async function PriceIndex() {
  const curatedSlugs = new Set(TRACKED.map((t) => t.slug));
  const dishes = (await getDishPages(3)).filter((d) => !curatedSlugs.has(d.dish));

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

        {dishes.length > 0 && (
          <>
            <div className="land-head" style={{ marginTop: 28 }}><h2>Every dish, by price</h2><p className="land-intro">Menu prices pulled from across the city — pick a dish and sort it cheapest to priciest.</p></div>
            <div className="list">
              {dishes.map((d) => (
                <Link key={d.dish} href={`/price/${d.dish}`} className="card" style={{ display: "block" }}>
                  <div className="c-name" style={{ fontSize: 16 }}>{d.label}</div>
                  <div className="c-type" style={{ marginTop: 4 }}>{d.venues} venue{d.venues === 1 ? "" : "s"} · ${d.min_price % 1 === 0 ? d.min_price : d.min_price.toFixed(2)}–${d.max_price % 1 === 0 ? d.max_price : d.max_price.toFixed(2)}</div>
                </Link>
              ))}
            </div>
          </>
        )}
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
