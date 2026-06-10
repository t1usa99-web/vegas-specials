import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getAuthors, authorOf } from "@/lib/blog";
import Newsletter from "@/components/Newsletter";

export const dynamic = "force-dynamic";
const ini = (n: string) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
const fdate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await getPost(params.slug);
  if (!p) return {};
  return { title: `${p.title} | VegasSpecials`, description: p.excerpt };
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) notFound();
  const authors = await getAuthors();
  const a = authorOf(post.author_id, authors);
  return (
    <>
      <div className="bloghead">
        <Link href="/blog" className="blogback">&larr; Blog</Link>
        <Link href="/" className="logo" style={{ fontSize: 16 }}><span className="dot" />Vegas<span className="gold">Specials</span></Link>
        <span />
      </div>
      <article className="article">
        <span className="ptag">{post.tag}</span>
        <h1>{post.title}</h1>
        <div className="byline big">
          <span className="av" style={{ background: a?.grad }}>{a ? ini(a.name) : ""}</span>
          <span className="bymeta"><b>{a ? <Link href={`/blog/author/${a.slug}`}>{a.name}</Link> : "Staff"}</b><span>{a?.title} &middot; {fdate(post.published_at)} &middot; {post.read_min} min read</span></span>
        </div>
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.body }} />
        {a && (
          <div className="authorbox">
            <span className="av lg" style={{ background: a.grad }}>{ini(a.name)}</span>
            <div>
              <b>{a.name}</b><span className="role">{a.title}</span>
              <p>{a.bio}</p>
              <Link href={`/blog/author/${a.slug}`} className="morelink">More from {a.name.split(" ")[0]} &rarr;</Link>
            </div>
          </div>
        )}
        <Newsletter source="blog_post" />
      </article>
    </>
  );
}
