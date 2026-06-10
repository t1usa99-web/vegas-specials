import { getSpecials, dbReady } from "@/lib/db";
import SpecialsList from "@/components/SpecialsList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const specials = await getSpecials();
  const live = await dbReady();

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">
            <span className="dot" />
            <span>Vegas<span className="gold">Specials</span></span>
          </div>
          <h1 className="tagline">Vegas deals <span className="hl">happening right now</span>, verified by locals.</h1>
          <p className="subline">Happy hours, food and drink specials, and freebies across the Strip and beyond, with real prices, the fine print, and when each was last confirmed.</p>
          <div className="locrow">
            <span className="pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>
              Las Vegas Strip
            </span>
            <span className="pill">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
              Updated continuously
            </span>
          </div>
        </div>
      </header>

      {!live && (
        <div className="banner">Preview mode &mdash; showing sample data while the live database warms up.</div>
      )}

      <SpecialsList initial={specials} />

      <footer className="foot">
        <p><b>VegasSpecials</b> is the freshest source for Las Vegas deals. Every listing shows a confidence score and when it was last verified, so you never walk to a special that is already gone.</p>
        <p style={{ marginTop: 8 }}>Spotted a deal we are missing? Snap the menu or sign and add it. Prices and times change fast, so always confirm with the venue.</p>
      </footer>
    </>
  );
}
