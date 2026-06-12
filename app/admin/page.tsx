import Link from "next/link";
import { cookies } from "next/headers";
import AdminLogin from "@/components/AdminLogin";
import ModerateList from "@/components/ModerateList";
import { getPendingSubmissions, getFlaggedSpecials } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | VegasSpecials", robots: { index: false, follow: false } };

export default async function Admin() {
  const authed = !!process.env.ADMIN_TOKEN && cookies().get("admin")?.value === process.env.ADMIN_TOKEN;
  const [pending, flagged] = authed ? await Promise.all([getPendingSubmissions(), getFlaggedSpecials()]) : [[], []];
  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <span className="loc">Admin</span>
      </div></div>
      <div className="wrap">
        {!authed ? <AdminLogin /> : (
          <>
            <div className="land-head"><h1>Moderation</h1><p className="land-intro">Approve submissions into live deals, and handle flagged listings. Approved items publish immediately as verified.</p></div>
            <ModerateList pending={pending} flagged={flagged} />
          </>
        )}
      </div>
    </>
  );
}
