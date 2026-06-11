import Link from "next/link";
import MapView from "@/components/MapView";
export const dynamic = "force-dynamic";
export default function MapPage() {
  return (
    <>
      <div className="appbar">
        <div className="appbar-inner">
          <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
          <Link href="/" className="loc" style={{ textDecoration: "none" }}>&larr; Deals</Link>
        </div>
      </div>
      <MapView />
      <nav className="tabbar">
        <div className="tabbar-inner">
          <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
          <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>Search</Link>
          <Link href="/map" className="tab active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>Map</Link>
          <Link href="/blog" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Blog</Link>
        </div>
      </nav>
    </>
  );
}
