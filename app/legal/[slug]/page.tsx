import Link from "next/link";
import { notFound } from "next/navigation";
import { getLegal, LEGAL } from "@/lib/legal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const d = getLegal(params.slug);
  if (!d) return {};
  return { title: `${d.title} | VegasSpecials`, description: d.desc };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const d = getLegal(params.slug);
  if (!d) notFound();
  const others = LEGAL.filter((x) => x.slug !== d.slug);
  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/" className="loc" style={{ textDecoration: "none" }}>&larr; Home</Link>
      </div></div>
      <div className="wrap" style={{ maxWidth: 760 }}>
        <div className="land-head"><h1>{d.title}</h1></div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: d.html }} />
        <div className="land-related" style={{ marginTop: 28 }}>
          <h2>More</h2>
          <div className="land-rel-row">
            {others.map((o) => <Link key={o.slug} href={`/legal/${o.slug}`} className="land-rel">{o.title}</Link>)}
          </div>
        </div>
      </div>
    </>
  );
}
