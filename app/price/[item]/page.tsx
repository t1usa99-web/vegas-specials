import Link from "next/link";
import { notFound } from "next/navigation";
import { getTracked, getPriceComparison, TRACKED } from "@/lib/price";
import PriceTable from "@/components/PriceTable";
import { robotsMeta, THIN } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { item: string } }) {
  const t = getTracked(params.item);
  if (!t) return {};
  const rows = await getPriceComparison(t);
  return { title: `${t.h1} (Live, Sortable) | VegasSpecials`, description: t.intro, ...robotsMeta(rows.length < THIN.price) };
}

const monthYear = () => new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default async function PricePage({ params }: { params: { item: string } }) {
  const t = getTracked(params.item);
  if (!t) notFound();
  const rows = await getPriceComparison(t);
  const cheapest = rows.length ? rows[0].price : null;
  const related = TRACKED.filter((x) => x.slug !== t.slug).slice(0, 8);

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/price" className="loc" style={{ textDecoration: "none" }}>All prices</Link>
      </div></div>

      <div className="wrap">
        <div className="land-head">
          <h1>{t.h1}</h1>
          <p className="land-intro">{t.intro}</p>
          <div className="land-fresh"><span className="live-dot" /> {rows.length} venue{rows.length === 1 ? "" : "s"}{cheapest != null ? ` · from $${cheapest % 1 === 0 ? cheapest : cheapest.toFixed(2)}` : ""} · updated {monthYear()}</div>
        </div>

        <PriceTable rows={rows} />

        <div className="land-related">
          <h2>Compare other prices</h2>
          <div className="land-rel-row">
            {related.map((x) => <Link key={x.slug} href={`/price/${x.slug}`} className="land-rel">{x.label}</Link>)}
          </div>
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
