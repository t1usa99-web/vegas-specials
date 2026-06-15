import Link from "next/link";
import { FREE_THINGS } from "@/lib/freeThings";
import Faq from "@/components/Faq";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Free Things to Do in Las Vegas (2026) — No-Cost Shows, Sights & Attractions | VegasSpecials",
  description: "The best genuinely free things to do in Las Vegas — the Bellagio fountains, Fremont Street light show, Sphere, free concerts, art and more, on and off the Strip.",
};

export default function FreeThings() {
  const order = { Strip: 0, Downtown: 1, Beyond: 2 } as const;
  const items = [...FREE_THINGS].sort((a, b) => order[a.area] - order[b.area]);
  const faqs = [
    { q: "What's the best free thing to do in Las Vegas?", a: "The Fountains of Bellagio are the classic — a free water-and-music show every 15–30 minutes. After dark, add the Fremont Street light show downtown and the Sphere's Exosphere on the Strip." },
    { q: "Are there free things to do on the Strip?", a: "Plenty. The Bellagio fountains and conservatory, the Flamingo wildlife habitat, the Venetian's canals, the Wynn's Lake of Dreams, the Sphere exterior and the Welcome to Las Vegas sign are all free." },
    { q: "Is the Mirage volcano still running?", a: "No — the Mirage closed in 2024, and the volcano show ended with it. The site is being redeveloped into the Hard Rock Las Vegas." },
    { q: "What's free to do downtown?", a: "The Fremont Street Experience light shows and live concerts are free, as is Downtown Container Park's nightly fire-breathing mantis and the Arts District murals." },
  ];

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/best" className="loc" style={{ textDecoration: "none" }}>Guides</Link>
      </div></div>

      <div className="wrap">
        <div className="land-head">
          <h1>Free Things to Do in Las Vegas</h1>
          <p className="land-intro">The best things in Vegas that cost nothing — free shows, sights and attractions on and off the Strip. No tickets, no cover, no resort fee.</p>
          <div className="land-fresh"><span className="live-dot" /> {FREE_THINGS.length} genuinely free things · updated 2026</div>
        </div>

        <div className="list">
          {items.map((f) => (
            <div key={f.name} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
                <div className="c-name" style={{ fontSize: 16 }}>{f.name}</div>
                <span className="t" style={{ flexShrink: 0, background: "#eef6f1", color: "#0f8a5f" }}>{f.area}</span>
              </div>
              <div className="c-type" style={{ marginTop: 4 }}>{f.what}</div>
              <div className="c-type" style={{ marginTop: 3, fontWeight: 600 }}>🕑 {f.when}</div>
            </div>
          ))}
        </div>

        <Faq items={faqs} />
      </div>

      <nav className="tabbar"><div className="tabbar-inner">
        <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
        <Link href="/map" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>Map</Link>
        <Link href="/price" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Prices</Link>
        <Link href="/best" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Guides</Link>
      </div></nav>
    </>
  );
}
