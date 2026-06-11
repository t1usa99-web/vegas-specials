import Link from "next/link";
import { notFound } from "next/navigation";
import { getVenue, getVenueSpecials } from "@/lib/venue";
import SaveButton from "@/components/SaveButton";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const v = await getVenue(params.id);
  if (!v) return {};
  return { title: `${v.name} — happy hour & specials | VegasSpecials`, description: `Current happy hours, drink specials and deals at ${v.name}${v.neighborhood ? " (" + v.neighborhood + ")" : ""}, Las Vegas. Verified prices and times.` };
}

const fdate = (iso: string) => { const d = Math.round((Date.now() - new Date(iso).getTime()) / 86400000); return d <= 0 ? "today" : d === 1 ? "yesterday" : d + "d ago"; };
const dollars = (n: number | null) => n == null ? "" : "$".repeat(Math.min(4, n + 1));

export default async function VenuePage({ params }: { params: { id: string } }) {
  const v = await getVenue(params.id);
  if (!v) notFound();
  const specials = await getVenueSpecials(params.id);
  const photos: string[] = Array.isArray(v.photos) ? v.photos : [];
  const reviews: any[] = Array.isArray(v.reviews) ? v.reviews : [];
  const dir = v.lat && v.lng ? `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}` : null;

  return (
    <>
      <div className="appbar">
        <div className="appbar-inner">
          <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
          <Link href="/" className="loc" style={{ textDecoration: "none" }}>&larr; Deals</Link>
        </div>
      </div>

      <div className="vp">
        {v.photo_ref ? (
          <div className="vp-hero" style={{ backgroundImage: `url(/api/photo?ref=${encodeURIComponent(v.photo_ref)})` }} />
        ) : <div className="vp-hero vp-hero-blank" />}

        <div className="vp-head">
          <h1>{v.name}</h1>
          <div className="vp-meta">
            {v.rating && <span className="vp-rate">★ {v.rating}</span>}
            {v.price_level != null && <span>{dollars(v.price_level)}</span>}
            {v.type && <span>{v.type}</span>}
            {v.neighborhood && <span><i>·</i> {v.neighborhood}</span>}
          </div>
          <div className="vp-actions">
            <SaveButton id={v.id} name={v.name} />
            {dir && <a className="vp-act" href={dir} target="_blank" rel="noopener">Directions ↗</a>}
            {v.website && <a className="vp-act" href={v.website} target="_blank" rel="noopener">Website ↗</a>}
            {v.phone && <a className="vp-act" href={`tel:${v.phone}`}>Call</a>}
          </div>
        </div>

        {photos.length > 1 && (
          <div className="vp-gallery">
            {photos.slice(1, 6).map((ref, i) => (
              <img key={i} src={`/api/photo?ref=${encodeURIComponent(ref)}`} alt={`${v.name} photo ${i + 2}`} loading="lazy" />
            ))}
          </div>
        )}
        <h2 className="vp-sec">Specials &amp; happy hours</h2>
        <div className="vp-list">
          {specials.length === 0 && <div className="empty">No verified specials right now. <Link href="/">Browse other venues</Link></div>}
          {specials.map((s, i) => {
            const hasMain = s.start_time && s.start_time !== "TBD";
            const window = hasMain ? `${s.days || "Daily"} · ${s.start_time}${s.end_time && s.end_time !== s.start_time ? "–" + s.end_time : ""}` : "Times vary — confirm with venue";
            return (
              <div className="vp-sp" key={i}>
                <div className="vp-sp-top">
                  <div className="vp-sp-sum">{s.summary}</div>
                  {s.price != null && <span className="vp-price">${Number(s.price)}</span>}
                </div>
                <div className="vp-windows">
                  <span className="vp-win"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>{window}</span>
                  {s.reverse_window && <span className="vp-win late">Late night · {s.reverse_window}</span>}
                </div>
                {s.outlet && <div className="vp-outlet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-5.5-7-11a7 7 0 1114 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>at <b>{s.outlet}</b></div>}
                <div className="vp-sp-foot">
                  {s.food && <span className="t food">Food</span>}
                  {s.drink && <span className="t drink">Drink</span>}
                  {s.freebie && <span className="t free">Freebie</span>}
                  {s.outlet && <span className="t">{s.outlet}</span>}
                  <span className="vp-verified">✓ verified {fdate(s.last_verified_at)}{s.source_url ? <> · <a href={s.source_url} target="_blank" rel="noopener">source</a></> : null}</span>
                </div>
                {s.fine_print && <div className="fineprint" style={{ marginTop: 8 }}><span>{s.fine_print}</span></div>}
              </div>
            );
          })}
        </div>

        {reviews.length > 0 && (
          <div className="vp-reviews">
            <h2 className="vp-sec" style={{ padding: "0 0 0 0" }}>Recent reviews</h2>
            {reviews.map((r, i) => (
              <div className="vp-rev" key={i}>
                <div className="vp-rev-h">
                  {r.avatar ? <img className="vp-rev-av" src={r.avatar} alt="" loading="lazy" /> : <span className="vp-rev-av vp-rev-blank">{(r.author || "G")[0]}</span>}
                  <div><b>{r.author}</b><span className="vp-rev-meta">{r.rating ? "★".repeat(Math.round(r.rating)) : ""} · {r.time}</span></div>
                </div>
                <p className="vp-rev-text">{r.text}</p>
              </div>
            ))}
            <div className="vp-rev-attr">Reviews from Google</div>
          </div>
        )}

        <div className="vp-soon">
          <b>Coming soon for this venue</b>
          <p>Full menu &amp; prices (via the venue's POS), and photos submitted by locals. Spotted a special we're missing? <Link href="/">Add it from a photo</Link>.</p>
        </div>
      </div>

      <nav className="tabbar">
        <div className="tabbar-inner">
          <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
          <Link href="/map" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>Map</Link>
          <Link href="/blog" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Blog</Link>
          <Link href="/saved" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z"/></svg>Saved</Link>
        </div>
      </nav>
    </>
  );
}
