import { getSpecials, dbReady } from "@/lib/db";
import SpecialsList from "@/components/SpecialsList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const specials = await getSpecials();
  const live = await dbReady();

  return (
    <>
      <header className="hero">
        <div className="hero-inner">
          <div className="brand">
            <span className="dot" />
            <span>Vegas<span className="gold">Specials</span></span>
          </div>
          <h1 className="tagline">Vegas deals <span className="hl">happening right now</span>, verified by locals.</h1>
          <p className="subline">Happy hours, food &amp; drink specials, and freebies across the Strip and beyond — with real prices, the fine print, and when each was last con