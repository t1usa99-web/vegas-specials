import Link from "next/link";
import { getSpecials, dbReady } from "@/lib/db";
import SpecialsList from "@/components/SpecialsList";
import Newsletter from "@/components/Newsletter";

export const dynamic = "force-dynamic";

export default async function Home() {
  const specials = await getSpecials();
  const live = await dbReady();

  return (
    <>
      <div className="appbar">
        <div className="appbar-inner">
          <div className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/blog" className="loc" style={{ textDecoration: "none" }}>Blog</Link>
            <span className="loc">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
              The Strip
            </span>
          </div>
        </div>
      </div>

      <div className="hero">
        <h1>What&apos;s <span className="hl">live right now</span> near you</h1>
        <p className="sub">Real Vegas deals, verified by locals &mdash; with prices, the fine print, and when each was last confirmed.</p>
      </div>

      {!live && <div className="banner">Preview mode &mdash; showing sample data while the live database warms up.</div>}

      <SpecialsList initial={specials} />

      <div className="wrap" style={{ paddingTop: 0 }}>
        <Newsletter source="home" />
      </div>

      <footer className="foot">
        <p><b>VegasSpecials</b> is the freshest source for Las Vegas deals. Every listing shows a confidence score and when it was last verified, so you never walk to a special that is already gone.</p>
        <p style={{ marginTop: 8 }}>Read the <Link href="/blog" style={{ color: "var(--accent)", fontWeight: 600 }}>blog</Link> for local guides, or confirm prices with the venue &mdash; they change fast.</p>
      </footer>

      <nav className="tabbar">
        <div className="tabbar-inner">
          <Link href="/" className="tab active">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>
            Home
          </Link>
          <Link href="/map" className="tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>
            Map
          </Link>
          <Link href="/blog" className="tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13a0 0 0 01 0 0H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>
            Blog
          </Link>
          <button className="tab">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 4h12a1 1 0 011 1v15l-7-4-7 4V5a1 1 0 011-1z"/></svg>
            Saved
          </button>
        </div>
      </nav>
    </>
  );
}
