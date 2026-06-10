import { Pool } from "pg";

export type Author = { id: string; slug: string; name: string; role: "admin" | "editor" | "author"; title: string; bio: string; expertise: string; grad: string; joined: string };
export type Post = { id: number; slug: string; title: string; excerpt: string; body: string; author_id: string; status: string; published_at: string; read_min: number; tag: string };

export const AUTHORS: Author[] = [
  { id: "a_j", slug: "j", name: "J", role: "admin", title: "Founder & Editor", bio: "Vegas condo owner and full-time deal hunter. Started VegasSpecials after one too many walks to a happy hour that had already ended.", expertise: "Strip & off-Strip happy hours, locals deals", grad: "linear-gradient(135deg,#e0356e,#f76aa0)", joined: "2026-01" },
  { id: "a_marisol", slug: "marisol-vega", name: "Marisol Vega", role: "editor", title: "Food & Drink Editor", bio: "Las Vegas food writer for over a decade. If there's a $5 plate worth eating between the Strat and Mandalay Bay, she's already reviewed it.", expertise: "Dining specials, buffets, Chinatown", grad: "linear-gradient(135deg,#7c3aed,#a855f7)", joined: "2026-02" },
  { id: "a_deshawn", slug: "deshawn-brooks", name: "DeShawn Brooks", role: "author", title: "Nightlife Contributor", bio: "Bartender turned nightlife writer. Covers dayclubs, late-night menus, and where the industry actually drinks after a shift.", expertise: "Nightlife, dayclubs, late-night", grad: "linear-gradient(135deg,#0891b2,#22d3ee)", joined: "2026-03" },
];

const ago = (days: number) => new Date(Date.now() - days * 86400000).toISOString();

export const POSTS: Post[] = [
  { id: 1, slug: "best-happy-hours-las-vegas-strip-right-now", title: "The 7 Best Happy Hours on the Las Vegas Strip Right Now", excerpt: "Verified this week: where to find half-off steaks, $5 drafts, and 2-for-1 cocktails without leaving the Boulevard.", author_id: "a_marisol", status: "published", published_at: ago(2), read_min: 6, tag: "Happy Hour",
    body: `<p>The Strip has a reputation for being expensive, and most of the time it earns it. But between 2pm and 6pm a different city emerges &mdash; one where a craft cocktail is $7 and a filet is fifteen bucks. We verified every deal below in person or by photo this week.</p>
<h2>1. Herbs &amp; Rye &mdash; 50% off everything</h2>
<p>The gold standard. From 5&ndash;8pm daily, the entire menu is half price &mdash; cocktails, wine, oysters, and yes, steaks. A 9oz filet lands at $15. There's a late-night seating from 11:59pm too, for the truly nocturnal.</p>
<h2>2. Yardbird at The Venetian</h2>
<p>$5 drafts, $6 house wine, $7 bourbon cocktails, and $5 deviled eggs, Monday through Friday. The bar runs a second window from 9pm to close.</p>
<h2>3. Beerhaus at The Park</h2>
<p>A $9.99 burger and fries, add a draft for $4.99. Twenty-plus beers on tap and a patio that's perfect before a show at T-Mobile.</p>
<p>See the full, always-updated list on our <a href="/">live happy hour tracker</a> &mdash; every listing shows when it was last confirmed.</p>`,
  },
  { id: 2, slug: "how-to-drink-in-vegas-without-going-broke", title: "How to Drink in Vegas Without Going Broke", excerpt: "A local's playbook: players cards, reverse happy hours, and the off-Strip bars where your money actually goes further.", author_id: "a_deshawn", status: "published", published_at: ago(5), read_min: 5, tag: "Guide",
    body: `<p>I spent six years behind a Vegas bar before I started writing about them. Here's what the tourists don't know.</p>
<h2>Get the players card &mdash; even if you don't gamble</h2>
<p>Casino loyalty cards are free and routinely unlock $3 mimosas, free beers for veterans, and drink credits. Ellis Island gives active military and vets a free house beer daily. You're leaving money on the table without one.</p>
<h2>Learn the reverse happy hour</h2>
<p>Everyone hits 4pm happy hour. The savvy move is the late-night version &mdash; many spots run a second discount window from 10pm or midnight, when the crowds thin out and the same deals reappear.</p>
<h2>Cross the street</h2>
<p>Two blocks off the Boulevard, prices fall off a cliff. The Arts District and Chinatown are where locals actually drink. Our <a href="/">tracker</a> filters by neighborhood so you can find the closest off-Strip deal.</p>`,
  },
  { id: 3, slug: "where-to-find-dollar-oysters-las-vegas", title: "Locals' Secret: Where to Find $1 Oysters in Las Vegas", excerpt: "Yes, dollar oysters still exist in this town. Here's where, when, and how to know they're fresh.", author_id: "a_marisol", status: "published", published_at: ago(9), read_min: 4, tag: "Food",
    body: `<p>Dollar oyster happy hours are one of the last great Vegas bargains. The Oyster Bar at Palace Station runs $1 oysters and is open 24/7 &mdash; a hidden gem tucked inside an off-Strip locals casino.</p>
<h2>How to know they're fresh</h2>
<p>A high-turnover oyster bar is a safe oyster bar. Look for a line, ask what came in today, and trust the spots that move volume. We tag every seafood special with a confidence score and a "last verified" date so you're never guessing.</p>
<p>Browse current seafood and happy hour deals on the <a href="/">live tracker</a>.</p>`,
  },
];

let pool: Pool | null = null;
function getPool() {
  if (!process.env.DATABASE_URL) return null;
  if (!pool) pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DATABASE_URL.includes("localhost") ? false : { rejectUnauthorized: false } });
  return pool;
}

export async function getPosts(): Promise<Post[]> {
  const p = getPool();
  if (!p) return POSTS.filter((x) => x.status === "published");
  try {
    const { rows } = await p.query("SELECT * FROM posts WHERE status='published' ORDER BY published_at DESC");
    return rows.length ? rows : POSTS.filter((x) => x.status === "published");
  } catch { return POSTS.filter((x) => x.status === "published"); }
}
export async function getPost(slug: string): Promise<Post | null> {
  const p = getPool();
  if (!p) return POSTS.find((x) => x.slug === slug) || null;
  try {
    const { rows } = await p.query("SELECT * FROM posts WHERE slug=$1 AND status='published'", [slug]);
    return rows[0] || POSTS.find((x) => x.slug === slug) || null;
  } catch { return POSTS.find((x) => x.slug === slug) || null; }
}
export async function getAuthors(): Promise<Author[]> {
  const p = getPool();
  if (!p) return AUTHORS;
  try { const { rows } = await p.query("SELECT * FROM authors"); return rows.length ? rows : AUTHORS; } catch { return AUTHORS; }
}
export async function getAuthor(slug: string): Promise<Author | null> {
  return (await getAuthors()).find((a) => a.slug === slug) || null;
}
export function authorOf(id: string, authors: Author[]) { return authors.find((a) => a.id === id) || null; }
