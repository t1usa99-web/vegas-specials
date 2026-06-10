import { getSpecials } from "@/lib/db";
import { dbReady } from "@/lib/db";
import SpecialsList from "@/components/SpecialsList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const specials = await getSpecials();
  const live = await dbReady();
  return (
    <main className="wrap">
      <div className="head">
        <div>
          <div className="title">Specials near you</div>
          <div className="sub">The Strip · Las Vegas · {specials.length} listings</div>
        </div>
      </div>
      {!live && (
        <div className="banner">
          Running on seed data — attach a Postgres database (DATABASE_URL) and run <code>npm run seed</code> to go live.
        </div>
      )}
      <SpecialsList initial={specials} />
    </main>
  );
}
