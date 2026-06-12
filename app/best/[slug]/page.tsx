import Link from "next/link";
import { notFound } from "next/navigation";
import { getLanding, landingResults, LANDINGS } from "@/lib/landing";
import Faq from "@/components/Faq";
import { robotsMeta, THIN } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const def = getLanding(params.slug);
  if (!def) return {};
  const results = await landingResults(def);
  return { title: `${def.title} | VegasSpecials`, description: def.intro, ...robotsMeta(results.length < THIN.landing) };
}

const monthYear = () => new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

export default async function Landing({ params }: { params: { slug: string } }) {
  const def = getLanding(params.slug);
  if (!def) notFound();
  const results = await landingResults(def);
  const related = LANDINGS.filter((l) => l.slug !== def.slug).slice(0, 6);

  const topic = def.h1.replace(/ in Las Vegas.*$/, "").replace(/^Best /, "").trim();
  const cheapest = results.reduce((m: number | null, r: any) => (r.cheapest != null && (m == null || r.cheapest < m) ? r.cheapest : m), null as number | null);
  const faqs = [
    { q: "What time is happy hour in Las Vegas?", a: "Most Las Vegas happy hours run 3-7pm Monday through Friday, though a growing number run daily, including weekends. Every listing on this page shows the exact days and times, plus when it was last verified." },
    ...(results.length ? [{ q: `How many ${topic.toLowerCase()} does VegasSpecials track?`, a: `We currently list ${results.length} verified ${topic.toLowerCase()} in Las Vegas, updated automatically as our crawler and local contributors confirm new deals.` }] : []),
    ...(cheapest != null ? [{ q: "What is the cheapest deal on this page?", a: `The lowest verified price here is $${Math.round(cheapest)}. Prices change fast, so each card shows when the deal was last confirmed.` }] : []),
    { q: "Are these Las Vegas deals verified?", a: "Yes. Every special carries a confidence score and a last-verified date. Deals are sourced from venue pages, our crawler and local contributors, then re-checked regularly so you never walk to a special that is already gone." },
  ];

  const jsonld = {
    "@context": "https://schema.org", "@type": "ItemList", name: def.title,
    itemListElement: results.slice(0, 30).map((r, i) => ({ "@type": "ListItem", position: i + 1, name: r.name })),
  };

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/best" className="loc" style={{ textDecoration: "none" }}>All guides</Link>
      </div></div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }} />

      <div className="wrap">
        <div className="land-head">
          <h1>{def.h1}</h1>
          <p className="land-intro">{def.intro}</p>
          <div className="land-fresh"><span className="live-dot" /> {results.length} verified spots · updated {monthYear()}</div>
        </div>

        <div className="list">
          {results.length === 0 && <div className="empty"><b>No verified deals here yet</b>Check back soon — our crawler updates weekly. <Link href="/">Browse all deals</Link></div>}
          {results.map((r) => (
            <Link key={r.id} href={`/venue/${r.id}`} className="card" style={{ display: "block" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
                <div className="c-name" style={{ fontSize: 16 }}>{r.name}</div>
                {r.cheapest != null && <span className="vp-price">from ${Math.round(r.cheapest)}</span>}
              </div>
              <div className="c-type">{r.rating ? `★ ${r.rating} · ` : ""}{r.neighborhood}</div>
              <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                {(r.specials || []).slice(0, 3).map((s: any, j: number) => (
                  <div key={j} style={{ fontSize: 13.5, color: "#3d3744" }}>
                    {s.summary}{s.start && s.start !== "TBD" ? <span style={{ color: "var(--muted)" }}> · {s.days} {s.start}{s.end && s.end !== s.start ? "–" + s.end : ""}</span> : null}{s.outlet ? <span style={{ color: "var(--muted)" }}> · {s.outlet}</span> : null}
                  </div>
                ))}
              </div>
            </Link>
          ))}
        </div>

        <Faq items={faqs} />

        <div className="land-related">
          <h2>More Las Vegas deal guides</h2>
          <div className="land-rel-row">
            {related.map((l) => <Link key={l.slug} href={`/best/${l.slug}`} className="land-rel">{l.h1}</Link>)}
          </div>
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
