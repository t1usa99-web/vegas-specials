// Best odds in Las Vegas. "House edge" = the long-run cost to the player with
// correct strategy (well-established figures). "Casino hold" = what Nevada
// casinos ACTUALLY won per the Nevada Gaming Control Board (2023 annual report) —
// far higher than the house edge because most players don't play optimally and
// re-buy. The gap is the whole point: good strategy massively narrows it.
export const HOLD_YEAR = "2023";

export type Game = { game: string; edge: string; edgeNum: number; hold: string | null; skill: "None" | "Easy" | "Strategy"; note: string };

export const GAMES: Game[] = [
  { game: "Video Poker (9/6 Jacks or Better)", edge: "0.46%", edgeNum: 0.46, hold: null, skill: "Strategy", note: "Full-pay machine + perfect play = the best odds in the casino. Counts as a 'slot' in NGCB data." },
  { game: "Blackjack", edge: "~0.5%", edgeNum: 0.5, hold: "14.82%", skill: "Strategy", note: "Basic strategy + good rules (3:2 blackjack, dealer stands on soft 17). The huge hold gap is players not using strategy." },
  { game: "Baccarat — Banker bet", edge: "1.06%", edgeNum: 1.06, hold: "16.42%", skill: "None", note: "Just bet Banker every hand. Never bet the Tie (14%+ edge)." },
  { game: "Craps — Pass / Come + odds", edge: "1.41%", edgeNum: 1.41, hold: "16.62%", skill: "Easy", note: "Pass/Come line; taking maximum odds drops the effective edge well below 1%. Avoid the prop bets in the middle." },
  { game: "Baccarat — Player bet", edge: "1.24%", edgeNum: 1.24, hold: "16.42%", skill: "None", note: "Slightly worse than Banker but no commission." },
  { game: "Ultimate Texas Hold'em", edge: "2.19%", edgeNum: 2.19, hold: null, skill: "Strategy", note: "Low edge for a carnival game if you play the 4x raise correctly." },
  { game: "Pai Gow Poker", edge: "2.5%", edgeNum: 2.5, hold: null, skill: "Easy", note: "Tons of pushes means your money lasts a long time — great for slow, social play." },
  { game: "Roulette — single-zero (European)", edge: "2.70%", edgeNum: 2.70, hold: "19.60%", skill: "None", note: "Half the edge of the standard wheel — seek out single-zero wheels (usually high-limit rooms)." },
  { game: "Three Card Poker", edge: "3.37%", edgeNum: 3.37, hold: null, skill: "Easy", note: "Play the Ante-Play; the Pair Plus side bet is worse (~7%)." },
  { game: "Let It Ride", edge: "3.51%", edgeNum: 3.51, hold: null, skill: "Easy", note: "Fun, slow, but a higher edge than the games above." },
  { game: "Caribbean Stud", edge: "5.22%", edgeNum: 5.22, hold: null, skill: "Easy", note: "The progressive side bet is a sucker bet unless the jackpot is enormous." },
  { game: "Roulette — double-zero (American)", edge: "5.26%", edgeNum: 5.26, hold: "19.60%", skill: "None", note: "The standard Vegas wheel. The green 0 and 00 are the house edge." },
  { game: "Slots", edge: "~5–12%", edgeNum: 8, hold: "~8–11%", skill: "None", note: "Varies widely. Higher denominations and off-Strip casinos pay back more — see our Loosest Slots page." },
  { game: "Big Six / Wheel of Fortune", edge: "11–24%", edgeNum: 18, hold: null, skill: "None", note: "One of the worst bets on the floor." },
  { game: "Keno", edge: "25–29%", edgeNum: 27, hold: null, skill: "None", note: "The single worst bet in the casino. Fun, slow, but brutal odds." },
];
