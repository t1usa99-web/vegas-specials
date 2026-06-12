"use client";
import { useState } from "react";
import Link from "next/link";

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 12px", fontSize: 15, fontFamily: "inherit", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", color: "var(--ink)", marginTop: 4 };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginTop: 14 };

function resizeImage(file: File, max = 1280, quality = 0.82): Promise<{ dataUrl: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      const ctx = c.getContext("2d"); if (!ctx) return reject();
      ctx.drawImage(img, 0, 0, c.width, c.height);
      resolve({ dataUrl: c.toDataURL("image/jpeg", quality), mediaType: "image/jpeg" });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export default function Submit() {
  const [mode, setMode] = useState<"type" | "photo">("type");
  const [form, setForm] = useState({ venue: "", neighborhood: "", summary: "", days: "", time: "", price: "", role: "visitor", email: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<null | { kind: string; extracted?: any[] }>(null);
  const [err, setErr] = useState("");
  const set = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  async function submitForm() {
    setErr(""); if (!form.venue.trim() || !form.summary.trim()) { setErr("Please add the venue and the deal."); return; }
    setBusy(true);
    try {
      const r = await fetch("/api/submit", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (d.ok) setDone({ kind: "form" }); else setErr(d.error || "Something went wrong.");
    } catch { setErr("Couldn't reach the server."); } finally { setBusy(false); }
  }

  async function onPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    setErr(""); setBusy(true);
    try {
      const { dataUrl, mediaType } = await resizeImage(file);
      const r = await fetch("/api/photo-extract", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ imageBase64: dataUrl, mediaType }) });
      const d = await r.json();
      if (d.ok) setDone({ kind: "photo", extracted: d.specials || [] }); else setErr(d.error || "Couldn't read that photo.");
    } catch { setErr("Couldn't process that image."); } finally { setBusy(false); }
  }

  return (
    <>
      <div className="appbar"><div className="appbar-inner">
        <Link href="/" className="logo"><span className="dot" /><span>Vegas<span className="gold">Specials</span></span></Link>
        <Link href="/" className="loc" style={{ textDecoration: "none" }}>&larr; Deals</Link>
      </div></div>

      <div className="wrap" style={{ maxWidth: 560 }}>
        <div className="land-head">
          <h1>Add a deal</h1>
          <p className="land-intro">Know a special we&apos;re missing, or run a venue? Add it here. Snap a menu photo and we&apos;ll read the prices for you. Submissions are reviewed before they go live.</p>
        </div>

        {done ? (
          <div className="card" style={{ padding: 18 }}>
            <div className="c-name" style={{ fontSize: 18 }}>Thank you — it&apos;s in the queue.</div>
            {done.kind === "photo" && done.extracted && done.extracted.length > 0 && (
              <>
                <p style={{ margin: "10px 0 6px", fontSize: 14, color: "var(--muted)" }}>We read {done.extracted.length} item{done.extracted.length === 1 ? "" : "s"} from your photo:</p>
                <div className="tags" style={{ flexDirection: "column", alignItems: "stretch", gap: 6 }}>
                  {done.extracted.map((s: any, i: number) => (
                    <span key={i} className="t" style={{ textAlign: "left" }}>{s.summary || s.name}{s.price ? ` — $${s.price}` : ""}{s.days ? ` · ${s.days}` : ""}{s.time ? ` ${s.time}` : ""}</span>
                  ))}
                </div>
              </>
            )}
            {done.kind === "photo" && (!done.extracted || done.extracted.length === 0) && (
              <p style={{ margin: "10px 0", fontSize: 14, color: "var(--muted)" }}>We couldn&apos;t read clear deals from that one — a reviewer will take a look.</p>
            )}
            <button className="addbtn" style={{ marginTop: 14 }} onClick={() => { setDone(null); setForm({ venue: "", neighborhood: "", summary: "", days: "", time: "", price: "", role: "visitor", email: "" }); }}>Add another</button>
          </div>
        ) : (
          <>
            <div className="chips" style={{ padding: "0 0 16px" }}>
              <button className={`chip ${mode === "type" ? "on" : ""}`} onClick={() => setMode("type")}>Type a deal</button>
              <button className={`chip ${mode === "photo" ? "on" : ""}`} onClick={() => setMode("photo")}>Snap a menu</button>
            </div>

            {mode === "type" ? (
              <div className="card" style={{ padding: 18 }}>
                <label style={labelStyle}>Venue *<input style={inputStyle} value={form.venue} onChange={set("venue")} placeholder="e.g. Herbs & Rye" /></label>
                <label style={labelStyle}>Neighborhood<input style={inputStyle} value={form.neighborhood} onChange={set("neighborhood")} placeholder="Strip, Downtown, Chinatown…" /></label>
                <label style={labelStyle}>The deal *<input style={inputStyle} value={form.summary} onChange={set("summary")} placeholder="$5 wells, half-off apps" /></label>
                <div style={{ display: "flex", gap: 10 }}>
                  <label style={{ ...labelStyle, flex: 1 }}>Days<input style={inputStyle} value={form.days} onChange={set("days")} placeholder="Mon–Fri" /></label>
                  <label style={{ ...labelStyle, flex: 1 }}>Time<input style={inputStyle} value={form.time} onChange={set("time")} placeholder="4–7 PM" /></label>
                  <label style={{ ...labelStyle, width: 90 }}>Price<input style={inputStyle} value={form.price} onChange={set("price")} placeholder="$5" /></label>
                </div>
                <label style={labelStyle}>I&apos;m a…
                  <select style={inputStyle} value={form.role} onChange={set("role")}>
                    <option value="visitor">Visitor / local</option>
                    <option value="owner">Owner / staff of this venue</option>
                  </select>
                </label>
                <label style={labelStyle}>Email (optional, if we need to confirm)<input style={inputStyle} value={form.email} onChange={set("email")} placeholder="you@email.com" /></label>
                {err && <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 12 }}>{err}</div>}
                <button className="addbtn" style={{ marginTop: 16, width: "100%" }} onClick={submitForm} disabled={busy}>{busy ? "Sending…" : "Submit deal"}</button>
              </div>
            ) : (
              <div className="card" style={{ padding: 18, textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 14 }}>Take or upload a photo of a menu, happy-hour board, or promo sign. We&apos;ll read the prices automatically.</p>
                <label className="addbtn" style={{ display: "inline-flex", cursor: "pointer" }}>
                  {busy ? "Reading photo…" : "Choose / take photo"}
                  <input type="file" accept="image/*" capture="environment" onChange={onPhoto} disabled={busy} style={{ display: "none" }} />
                </label>
                {err && <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 14 }}>{err}</div>}
              </div>
            )}
          </>
        )}
      </div>

      <nav className="tabbar"><div className="tabbar-inner">
        <Link href="/" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l9-7 9 7"/><path d="M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9"/></svg>Home</Link>
        <Link href="/price" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Prices</Link>
        <Link href="/submit" className="tab active"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>Add</Link>
        <Link href="/best" className="tab"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11l3 3v13H5z"/><path d="M8 9h8M8 13h8M8 17h5"/></svg>Guides</Link>
      </div></nav>
    </>
  );
}
