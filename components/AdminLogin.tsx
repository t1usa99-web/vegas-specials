"use client";
import { useState } from "react";
export default function AdminLogin() {
  const [token, setToken] = useState(""); const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function go() {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token }) });
      if (r.ok) location.reload(); else setErr("Wrong password.");
    } catch { setErr("Couldn't reach the server."); } finally { setBusy(false); }
  }
  return (
    <div className="card" style={{ padding: 20, maxWidth: 360, margin: "40px auto" }}>
      <div className="c-name" style={{ fontSize: 18, marginBottom: 12 }}>Admin</div>
      <input type="password" value={token} onChange={(e) => setToken(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} placeholder="Admin password"
        style={{ width: "100%", padding: "10px 12px", fontSize: 15, border: "1px solid var(--line)", borderRadius: 10, background: "#fff", color: "var(--ink)" }} />
      {err && <div style={{ color: "var(--accent)", fontSize: 13, marginTop: 10 }}>{err}</div>}
      <button className="addbtn" style={{ marginTop: 14, width: "100%" }} onClick={go} disabled={busy}>{busy ? "…" : "Enter"}</button>
    </div>
  );
}
