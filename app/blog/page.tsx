import Link from "next/link";
import { getPosts, getAuthors, authorOf } from "@/lib/blog";
import Newsletter from "@/components/Newsletter";

export const dynamic = "force-dynamic";
const ini = (n: string) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const fdate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default async function Blog() {
  const [posts, authors] = await Promise.all([getPosts(), getAuthors()]);
  return (
    <>
      <div className="bloghead">
        <Link href="/" className="blogback">&larr; Deals</Link>
        <Link href="/blog" className="logo" style={{ fontSize: 16 }}><span className="dot" />Vegas<span className="gold">Specials</span></Link>
        <span />
      </div>
      <div className="blogwrap">
        <div className="bloghero">
          <h1>The <span className="hl">VegasSpecials</span> Blog</h1>
          <p>Local writers on where to eat, drink, and save in Las Vegas &mdash; verified, never sponsored.</p>
        </div>
        <Newsletter source="blog_index" />
        <div className="postlist">
          {posts.map((p) => {
            const a = authorOf(p.author_id, authors);
            return (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="postcard">
                <span className="ptag">{p.tag}</span>
                <h2>{p.title}</h2>
                <p className="pex">{p.excerpt}</p>
                <div className="byline">
                  <span className="av" style={{ background: a?.grad }}>{a ? ini(a.name) : ""}</span>
                  <span className="bymeta"><b>{a?.name}</b><span>{a?.title} &middot; {fdate(p.published_at)} &middot; {p.read_min} min read</span></span>
                </div>
              </Link>
            );
          })}
        </div>
        <div className="authorstrip">
          <h3>Our local writers</h3>
          <div className="authrow">
            {authors.map((a) => (
              <Link key={a.slug} href={`/blog/author/${a.slug}`} className="authchip">
                <span className="av" style={{ background: a.grad }}>{ini(a.name)}</span>
                <span><b>{a.name}</b><span className="role">{a.title}</span></span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
