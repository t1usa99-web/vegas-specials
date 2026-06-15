// Free things to do in Las Vegas — curated, current as of 2026. Only genuinely
// free attractions (no admission). Excludes closed attractions (e.g. the Mirage
// volcano, closed 2024). Update if venues change.
export type Free = { name: string; area: "Strip" | "Downtown" | "Beyond"; what: string; when: string };

export const FREE_THINGS: Free[] = [
  { name: "Fountains of Bellagio", area: "Strip", what: "The iconic water-and-music show on the lake out front — the most famous free show in Vegas.", when: "Every 30 min afternoons, every 15 min from 8pm" },
  { name: "Bellagio Conservatory & Botanical Garden", area: "Strip", what: "Enormous seasonal flower-and-sculpture displays, changed five times a year.", when: "Open 24/7" },
  { name: "Fremont Street Experience (Viva Vision)", area: "Downtown", what: "The giant overhead LED canopy light show, plus free live-band stages all night.", when: "Shows hourly after dark; concerts nightly" },
  { name: "Sphere Exosphere", area: "Strip", what: "The world's largest LED screen, wrapping the outside of Sphere — free to watch from the street or the Venetian.", when: "Nightly after dark" },
  { name: "Flamingo Wildlife Habitat", area: "Strip", what: "Real Chilean flamingos, pelicans, koi and turtles in a lush garden inside the Flamingo.", when: "Open daily" },
  { name: "The Park & Bliss Dance", area: "Strip", what: "A leafy outdoor promenade between New York-New York and Park MGM, anchored by the 40-ft Bliss Dance statue.", when: "Open daily" },
  { name: "Welcome to Fabulous Las Vegas Sign", area: "Strip", what: "The classic 1959 neon sign — free photo op with a small parking lot.", when: "24/7 (lit at night)" },
  { name: "The Venetian Grand Canal", area: "Strip", what: "Stroll St. Mark's Square and the indoor canals under a painted-sky ceiling (gondola rides cost extra).", when: "Open daily" },
  { name: "Lake of Dreams at Wynn", area: "Strip", what: "A free nightly art-and-light show on the lagoon behind the Wynn esplanade.", when: "Nightly, on the hour after dark" },
  { name: "LINQ Promenade", area: "Strip", what: "An open-air walkway of shops and bars at the foot of the High Roller wheel — free to wander.", when: "Open daily" },
  { name: "Brand stores (M&M's, Hershey's, Coca-Cola)", area: "Strip", what: "Multi-floor candy and soda flagship stores — free to browse and sample.", when: "Open daily" },
  { name: "Downtown Container Park", area: "Downtown", what: "A shopping/dining plaza built from shipping containers, with a fire-breathing praying mantis sculpture.", when: "Mantis fire show nightly" },
  { name: "Las Vegas Arts District (18b) murals", area: "Downtown", what: "Blocks of street art, galleries and First Friday energy just south of Fremont.", when: "Anytime; First Friday each month" },
  { name: "Seven Magic Mountains", area: "Beyond", what: "Ugo Rondinone's 30-ft stacked neon boulders in the desert, ~10 miles south of the Strip.", when: "Daylight hours" },
  { name: "Ethel M Chocolate Factory & Cactus Garden", area: "Beyond", what: "Free self-guided factory viewing plus a 3-acre cactus garden in Henderson (dazzling holiday lights in winter).", when: "Open daily" },
  { name: "Pinball Hall of Fame", area: "Beyond", what: "A huge museum of vintage pinball and arcade machines — free entry, cheap to play.", when: "Open daily" },
];
