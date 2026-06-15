import Link from "next/link";
import { AREAS, DENOMS, LOOSE_ZONES, DATA_YEAR } from "@/lib/loosestSlots";
import Faq from "@/components/Faq";

export const dynamic = "force-dynamic";
export const metadata = {
  title: `Loosest Slots in Las Vegas (${DATA_YEAR} Gaming Control Board Data) | VegasSpecials`,
  description: "Where the loosest slots in Las Vegas actually are, using official Nevada Gaming Control Board payback data by area and denomination. The Strip vs Downtown vs off-Strip, ranked.",
};

const pct = (n: number) => n.toFixed(2) + "%";

export default function LoosestSlots() {
  const vegas = [...AREAS].filter((a) => a.vegas).sort((a, b) => b.payback - a.payback);
  const all = [...AREAS].sort((a, b) => b.payback - a.payback);
  const faqs = [
    { q: "Where are the loosest slots in Las Vegas?", a: `Per ${DATA_YEAR} Nevada Gaming Control Board data, the loosest slots in the Vegas metro are in the Boulder Strip area (Henderson/east, ${pct(93.52)} payback) and North Las Vegas (${pct(92.53)}). Both beat the Strip and Downtown.` },
    { q: "Are Strip or Downtown slots looser?", a: `The Strip — for the sixth year in a row. Strip slots paid back ${pct(92.17)} vs ${pct(91.70)} downtown in ${DATA_YEAR}. It's a reversal of the old assumption that Fremont Street was looser.` },
    { q: "What slot denomination pays back the most?", a: "Higher denominations. Penny slots are the tightest at about 90.9% statewide; quarters return ~92.4%, and $1-and-up machines typically return 94–97%. If you bet 75¢+ per spin on pennies, the same bet on a higher denomination usually gives better odds." },
    { q: "Does this mean a specific machine is loose?", a: "No. The NGCB reports by area, not by individual casino or machine, and every spin is independent. This is a statistical edge over time, not a guarantee — slots remain a losing bet at every denomination." },
  ];

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/best" className="loc" style={{ textDecoration: "none" }}>Guides</Link>
      </div></div>

      <div className="wrap">
        <div className="land-head">
          <h1>Loosest Slots in Las Vegas</h1>
          <p className="land-intro">Where slots actually pay back the most, using official Nevada Gaming Control Board data. The short answer: get off the Strip and Fremont Street, and play higher denominations.</p>
          <div className="land-fresh"><span className="live-dot" /> Official NGCB {DATA_YEAR} data · payback % = 100% − casino hold</div>
        </div>

        <h2 style={{ marginTop: 8 }}>Slot payback by area</h2>
        <div className="list">
          {vegas.map((a, i) => (
            <div key={a.area} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div className="c-name" style={{ fontSize: 16 }}>{i === 0 ? "🏆 " : ""}{a.area}</div>
                <div className="c-type" style={{ marginTop: 3 }}>Penny slots: {pct(a.pennyPayback)}{a.note ? ` · ${a.note}` : ""}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: i === 0 ? "#0f8a5f" : "var(--text)" }}>{pct(a.payback)}</div>
                <div className="c-type" style={{ fontSize: 11 }}>all denominations</div>
              </div>
            </div>
          ))}
        </div>
        <p className="c-type" style={{ fontSize: 12, marginTop: 6 }}>For reference, Reno returns {pct(94.53)} — the loosest in Nevada, well above anything near Las Vegas.</p>

        <h2 style={{ marginTop: 20 }}>Payback by denomination (statewide)</h2>
        <div className="list">
          {DENOMS.map((d) => (
            <div key={d.denom} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="c-name" style={{ fontSize: 16 }}>{d.denom}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{pct(d.payback)}{d.approx ? <span className="c-type" style={{ fontSize: 11, fontWeight: 400 }}> approx</span> : ""}</div>
            </div>
          ))}
        </div>
        <p className="c-type" style={{ fontSize: 12, marginTop: 6 }}>Penny and quarter figures are exact NGCB {DATA_YEAR} data; $1-and-up reflect the published trend (higher denominations are looser).</p>

        <h2 style={{ marginTop: 20 }}>Casinos in the loosest zones</h2>
        {LOOSE_ZONES.map((z) => (
          <div key={z.zone} style={{ marginBottom: 10 }}>
            <div className="c-name" style={{ fontSize: 15 }}>{z.zone} — {pct(z.payback)} payback</div>
            <div className="c-type" style={{ marginTop: 3 }}>{z.casinos.join(" · ")}</div>
          </div>
        ))}

        <p className="c-type" style={{ marginTop: 14, fontSize: 12 }}>Source: Nevada Gaming Control Board monthly revenue reports ({DATA_YEAR}). The NGCB groups casinos by area, not by individual property. Slots are a losing bet at every denomination — play responsibly.</p>

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
