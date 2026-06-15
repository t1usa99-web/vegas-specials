import Link from "next/link";
import { HOTELS, UPDATED } from "@/lib/resortFees";
import ResortFeeTable from "@/components/ResortFeeTable";
import Faq from "@/components/Faq";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Las Vegas Resort Fees & Parking by Hotel (2026) — Sortable | VegasSpecials",
  description: "Every Las Vegas hotel's resort fee and parking cost, sortable lowest to highest. See which hotels have free parking and which have no resort fee. Updated 2026.",
};

export default function ResortFeesPage() {
  const free = HOTELS.filter((h) => h.parkFree).length;
  const noFee = HOTELS.filter((h) => h.fee === 0).length;
  const faqs = [
    { q: "What is a Las Vegas resort fee?", a: "A mandatory nightly charge added on top of your room rate, supposedly covering Wi-Fi, the fitness center and pool. It's charged whether you use those amenities or not, and the 13.38% Clark County room tax is applied on top." },
    { q: "Which Las Vegas hotels have no resort fee?", a: "Very few. South Point is the standout — no resort fee and free parking. Most Strip hotels charge $45–$55 per night plus tax." },
    { q: "Which Las Vegas hotels have free parking?", a: `${free} of the hotels listed here. On the Strip, Sahara, Treasure Island, The STRAT and Fontainebleau offer free self-parking; nearly every off-Strip locals casino (Station, Boyd) is free. MGM and Caesars properties charge $18–$25 a day for self-parking.` },
    { q: "How can I avoid resort fees?", a: "Book with points (MGM Rewards and Caesars Rewards often waive resort fees on free-night redemptions), reach mid-tier loyalty status for free parking, or stay at a no-fee property like South Point." },
  ];

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/price" className="loc" style={{ textDecoration: "none" }}>Prices</Link>
      </div></div>

      <div className="wrap">
        <div className="land-head">
          <h1>Las Vegas Resort Fees & Parking by Hotel</h1>
          <p className="land-intro">Every hotel's resort fee and parking cost in one sortable table — the "garbage fees" that don't show up until checkout. Sort by lowest fee, or filter to free-parking hotels.</p>
          <div className="land-fresh"><span className="live-dot" /> {HOTELS.length} hotels · {free} with free parking · {noFee} with no resort fee · updated {UPDATED}</div>
        </div>

        <ResortFeeTable hotels={HOTELS} />

        <p className="c-type" style={{ marginTop: 14, fontSize: 12 }}>Resort fees are the advertised nightly rate before the 13.38% Clark County room tax. Parking is shown free vs paid; paid self-park is typically $18–$25/day at MGM &amp; Caesars and higher at Wynn &amp; The Venetian. Fees change often — verify at booking.</p>

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
