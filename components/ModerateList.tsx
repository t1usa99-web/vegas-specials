"use client";
import { useState } from "react";

function fmt(raw: any) {
  if (!raw) return "";
  if (raw.source === "user_photo") return `📷 ${(raw.specials || []).length} item(s) read from photo`;
  return [raw.summary, raw.days, raw.time, raw.price ? `$${raw.price}` : ""].filter(Boolean).join(" · ");
}

export default function ModerateList({ pending, flagged }: { pending: any[]; flagged: any[] }) {
  const [subs, setSubs] = useState(pending);
  const [flags, setFlags] = useState(flagged);

  async function act(id: number, action: string, kind: "sub" | "flag") {
    try { await fetch("/api/admin/action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, action }) }); } catch { /* */ }
    if (kind === "sub") setSubs((s) => s.filter((x) => x.id !== id));
    else setFlags((s) => s.filter((x) => x.id !== id));
  }

  const btn: React.CSSProperties = { font: "inherit", fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 8, border: "1px solid var(--line)", cursor: "pointer" };

  return (
    <>
      <h2 style={{ fontSize: 18, margin: "8px 0 12px" }}>Pending submissions ({subs.length})</h2>
      <div className="list">
        {subs.length === 0 && <div className="empty"><b>Nothing waiting</b>New submissions will appear here.</div>}
        {subs.map((s) => {
          const raw = s.raw_json || {};
          return (
            <div key={s.id} className="card" style={{ padding: 14 }}>
              <div className="c-name" style={{ fontSize: 15 }}>{raw.venue || s.venue_guess || "(no venue)"}{raw.role === "owner" ? " · owner" : ""}</div>
              <div className="c-type" style={{ margin: "4px 0 8px" }}>{fmt(raw)}</div>
              {raw.source === "user_photo" && (raw.specials || []).map((sp: any, i: number) => (
                <div key={i} style={{ fontSize: 13, color: "#3d3744" }}>• {sp.summary}{sp.price ? ` — $${sp.price}` : ""}{sp.days ? ` · ${sp.days}` : ""}</div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button style={{ ...btn, color: "var(--green)", borderColor: "var(--green)" }} onClick={() => act(s.id, "approve", "sub")}>Approve → publish</button>
                <button style={{ ...btn, color: "var(--muted)" }} onClick={() => act(s.id, "reject", "sub")}>Reject</button>
              </div>
            </div>
          );
        })}
      </div>

      <h2 style={{ fontSize: 18, margin: "26px 0 12px" }}>Flagged deals ({flags.length})</h2>
      <div className="list">
        {flags.length === 0 && <div className="empty"><b>None flagged</b>Deals the crowd reports as gone show up here.</div>}
        {flags.map((s) => (
          <div key={s.id} className="card" style={{ padding: 14 }}>
            <div className="c-name" style={{ fontSize: 15 }}>{s.venue}</div>
            <div className="c-type" style={{ margin: "4px 0 8px" }}>{s.summary} · 🚩 {s.flagged_count} flag(s) · ✓ {s.verified_count} confirm(s){s.status === "disputed" ? " · auto-hidden" : ""}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button style={{ ...btn, color: "var(--green)", borderColor: "var(--green)" }} onClick={() => act(s.id, "special_keep", "flag")}>Keep (still valid)</button>
              <button style={{ ...btn, color: "var(--accent)" }} onClick={() => act(s.id, "special_remove", "flag")}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
