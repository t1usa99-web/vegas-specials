import Link from "next/link";
import { notFound } from "next/navigation";
import { getAuthor, getPosts, getAuthors, authorOf } from "@/lib/blog";

export const dynamic = "force-dynamic";
const ini = (n: string) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const fdate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const ROLE: Record<string, string> = { admin: "Admin", editor: "Editor", author: "Contributor" };

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const a = await getAuthor(params.slug);
  if (!a) notFound();
  const [posts] = await Promise.all([getPosts()]);
  const mine = posts.filter((p) => p.author_id === a.id);
  return (
    <>
      <div className="bloghead">
        <Link href="/blog" className="blogback">&larr; Blog</Link>
        <Link href="/" className="logo" style={{ fontSize: 16 }}><span className="dot" />Vegas<span className="gold">Specials</span></Link>
        <span />
      </div>
      <div className="blogwrap">
        <div className="authorhero">
          <span className="av xl" style={{ background: a.grad }}>{ini(a.name)}</span>
          <h1>{a.name}</h1>
          <span className="rolepill">{ROLE[a.role] || "Contributor"} &middot; {a.title}</span>
          <p className="abio">{a.bio}</p>
          <p className="aexp"><b>Covers:</b> {a.expertise}</p>
        </div>
        <h3 style={{ margin: "8px 2px 12px" }}>Posts by {a.name.split(" ")[0]}</h3>
        <div className="postlist">
          {mine.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="postcard">
              <span className="ptag">{p.tag}</span>
              <h2>{p.title}</h2>
              <p className="pex">{p.excerpt}</p>
              <div className="byline"><span className="bymeta"><span>{fdate(p.published_at)} &middot; {p.read_min} min read</span></span></div>
            </Link>
          ))}
          {mine.length === 0 && <div className="empty">No published posts yet.</div>}
        </div>
      </div>
    </>
  );
}
