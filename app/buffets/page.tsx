import Link from "next/link";
import { BUFFETS, UPDATED } from "@/lib/buffets";
import BuffetTable from "@/components/BuffetTable";
import Faq from "@/components/Faq";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Las Vegas Buffet Prices 2026 — Every Open Buffet, Sortable | VegasSpecials",
  description: "Current Las Vegas buffet prices, sortable cheapest to priciest — brunch and dinner costs at Bacchanal, Wynn, Bellagio, Wicked Spoon, South Point and more. Which buffets are still open in 2026.",
};

export default function BuffetsPage() {
  const cheapest = Math.min(...BUFFETS.map((b) => Math.min(...[b.brunch, b.dinner].filter((x): x is number => x != null))));
  const faqs = [
    { q: "Which Las Vegas buffet is the best value?", a: `South Point's Garden Buffet is the local legend — brunch from about $${cheapest}, and even less with a player's card. Off the Strip and downtown buffets run roughly half the price of the Strip's "big three."` },
    { q: "What are the best buffets on the Strip?", a: "Bacchanal at Caesars Palace (crab legs and global variety), The Buffet at Wynn (the prettiest room) and The Buffet at Bellagio (high-end seafood) are the luxury tier. Wicked Spoon at the Cosmopolitan is brunch-only with individual small plates." },
    { q: "Is the Luxor buffet still open?", a: "No — the Luxor buffet is permanently closed, along with several others (MGM Grand, Rio and more). Guests are directed to the Excalibur buffet next door. The buffets listed here are the ones currently open." },
    { q: "Do I need a reservation, and is there a time limit?", a: "For Bacchanal, Wynn and Bellagio, yes — book up to 30 days ahead; weekend walk-in waits can exceed two hours. Most high-end buffets have a soft 90-minute limit. Kids under 3 often eat free and ages 4–10 are usually half price." },
  ];

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/price" className="loc" style={{ textDecoration: "none" }}>Prices</Link>
      </div></div>

      <div className="wrap">
        <div className="land-head">
          <h1>Las Vegas Buffet Prices</h1>
          <p className="land-intro">Every buffet still standing in Las Vegas, with current brunch and dinner prices — sortable cheapest to priciest. The $2.99 prime rib is long gone, but value still exists if you know where to look.</p>
          <div className="land-fresh"><span className="live-dot" /> {BUFFETS.length} open buffets · from ${cheapest} · updated {UPDATED}</div>
        </div>

        <BuffetTable buffets={BUFFETS} />

        <p className="c-type" style={{ marginTop: 14, fontSize: 12 }}>Prices are the typical weekday per-person rate before tax and are dynamic — expect a $5–15 surcharge on holiday weekends and major events like F1, and weekend brunch usually costs more than weekday. Verify before you go. <Link href="/resort-fees" style={{ color: "var(--accent)" }}>See resort fees →</Link></p>

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
