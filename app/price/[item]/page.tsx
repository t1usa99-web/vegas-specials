import Link from "next/link";
import { notFound } from "next/navigation";
import { getTracked, getPriceComparison, TRACKED } from "@/lib/price";
import { getDishMeta, getDishComparison, getDishPages } from "@/lib/dishes";
import PriceTable from "@/components/PriceTable";
import { robotsMeta, THIN } from "@/lib/seo";

export const dynamic = "force-dynamic";

const dishIntro = (label: string) =>
  `Every ${label.toLowerCase()} price we can find across Las Vegas — sort low to high for the cheapest, or high to low for the priciest in town.`;
const dishH1 = (label: string) => `${label} Prices in Las Vegas — Cheapest to Most Expensive`;

async function resolve(slug: string) {
  const t = getTracked(slug);
  if (t) return { h1: t.h1, intro: t.intro, rows: await getPriceComparison(t) };
  const d = await getDishMeta(slug);
  if (!d) return null;
  return { h1: dishH1(d.label), intro: dishIntro(d.label), rows: await getDishComparison(d.dish, d.label) };
}

export async function generateMetadata({ params }: { params: { item: string } }) {
  const r = await resolve(params.item);
  if (!r) return {};
  return { title: `${r.h1} (Live, Sortable) | VegasSpecials`, description: r.intro, ...robotsMeta(r.rows.length < THIN.price) };
}

const monthYear = () => new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default async function PricePage({ params }: { params: { item: string } }) {
  const r = await resolve(params.item);
  if (!r) notFound();
  const cheapest = r.rows.length ? r.rows[0].price : null;

  // related: curated items + top auto dishes, deduped, current excluded
  const dishes = await getDishPages(3);
  const relMap = new Map<string, string>();
  for (const t of TRACKED) relMap.set(t.slug, t.label);
  for (const d of dishes) if (!relMap.has(d.dish)) relMap.set(d.dish, d.label);
  const related = [...relMap].filter(([slug]) => slug !== params.item).slice(0, 10);

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/price" className="loc" style={{ textDecoration: "none" }}>All prices</Link>
      </div></div>

      <div className="wrap">
        <div className="land-head">
          <h1>{r.h1}</h1>
          <p className="land-intro">{r.intro}</p>
          <div className="land-fresh"><span className="live-dot" /> {r.rows.length} venue{r.rows.length === 1 ? "" : "s"}{cheapest != null ? ` · from $${cheapest % 1 === 0 ? cheapest : cheapest.toFixed(2)}` : ""} · updated {monthYear()}</div>
        </div>

        <PriceTable rows={r.rows} />

        <div className="land-related">
          <h2>Compare other prices</h2>
          <div className="land-rel-row">
            {related.map(([slug, label]) => <Link key={slug} href={`/price/${slug}`} className="land-rel">{label}</Link>)}
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
