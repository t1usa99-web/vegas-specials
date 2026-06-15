import Link from "next/link";
import { GAMES, HOLD_YEAR } from "@/lib/bestOdds";
import Faq from "@/components/Faq";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Best Odds in Las Vegas — Casino Games Ranked by House Edge (2026) | VegasSpecials",
  description: "Every Las Vegas casino game ranked by real house edge — and what casinos actually win per Nevada Gaming Control Board data. Blackjack, baccarat, craps, roulette, slots and keno, best to worst.",
};

export default function BestOdds() {
  const games = [...GAMES].sort((a, b) => a.edgeNum - b.edgeNum);
  const skillColor: Record<string, string> = { None: "#0f8a5f", Easy: "#2563eb", Strategy: "#b0357a" };
  const faqs = [
    { q: "What casino game has the best odds in Las Vegas?", a: "Full-pay video poker (9/6 Jacks or Better) with perfect strategy, at about 0.46%, edges out blackjack (~0.5%). For a no-skill game, the Baccarat Banker bet is best at 1.06%." },
    { q: "Why is the 'casino hold' so much higher than the house edge?", a: `House edge is the long-run cost with correct strategy. The Nevada Gaming Control Board "hold" is what casinos actually kept (${HOLD_YEAR}) — e.g. blackjack's edge is ~0.5% but its hold was 14.82%, because most players don't use strategy, make side bets, and re-buy. Playing well is what closes that gap.` },
    { q: "What's the worst bet in the casino?", a: "Keno (25–29% house edge) and the Big Six wheel are the worst on the floor. Among table games, avoid the Tie bet in baccarat and the prop bets in craps." },
    { q: "Are these odds the same at every casino?", a: "Close, but rules matter. Blackjack paying 3:2 (not 6:5) and a dealer who stands on soft 17 lower the edge; single-zero roulette halves it. Always check the felt and the pay tables before you sit." },
  ];

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/best" className="loc" style={{ textDecoration: "none" }}>Guides</Link>
      </div></div>

      <div className="wrap">
        <div className="land-head">
          <h1>Best Odds in Las Vegas</h1>
          <p className="land-intro">Every casino game ranked by its real house edge — and, where the state publishes it, what casinos <em>actually</em> won. The gap between the two is the cost of playing badly.</p>
          <div className="land-fresh"><span className="live-dot" /> House edge = correct-strategy cost · Casino hold = NGCB {HOLD_YEAR} actual</div>
        </div>

        <div className="list">
          {games.map((g, i) => (
            <div key={g.game} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
                <div className="c-name" style={{ fontSize: 16 }}>{i === 0 ? "🏆 " : ""}{g.game}</div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <span style={{ fontSize: 19, fontWeight: 800, color: g.edgeNum <= 1.5 ? "#0f8a5f" : g.edgeNum >= 5 ? "#b0357a" : "var(--text)" }}>{g.edge}</span>
                  <div className="c-type" style={{ fontSize: 11 }}>house edge</div>
                </div>
              </div>
              <div className="c-type" style={{ marginTop: 4 }}>
                <span style={{ color: skillColor[g.skill], fontWeight: 600 }}>{g.skill === "None" ? "No skill needed" : g.skill === "Easy" ? "Easy to learn" : "Strategy required"}</span>
                {g.hold ? ` · casinos actually kept ${g.hold}` : ""} · {g.note}
              </div>
            </div>
          ))}
        </div>

        <p className="c-type" style={{ marginTop: 14, fontSize: 12 }}>House-edge figures assume correct strategy and standard rules; they vary with the pay table and table rules. "Casino hold" is the Nevada Gaming Control Board's {HOLD_YEAR} statewide win percentage. Every game is a long-run loss — play for fun, set a budget. <Link href="/loosest-slots" style={{ color: "var(--accent)" }}>See the loosest slots →</Link></p>

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
