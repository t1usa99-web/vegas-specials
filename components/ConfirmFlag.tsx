"use client";
import { useEffect, useState } from "react";

export default function ConfirmFlag({ id, verified = 0 }: { id?: number; verified?: number }) {
  const [voted, setVoted] = useState<"confirm" | "flag" | null>(null);
  const [count, setCount] = useState(verified);
  const key = id ? `vote_${id}` : "";

  useEffect(() => { if (key && typeof window !== "undefined") { const v = localStorage.getItem(key); if (v === "confirm" || v === "flag") setVoted(v); } }, [key]);

  if (!id) return null;
  async function vote(v: "confirm" | "flag") {
    if (voted) return;
    setVoted(v); if (v === "confirm") setCount((c) => c + 1);
    try { localStorage.setItem(key, v); } catch { /* */ }
    try { await fetch("/api/confirm", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id, vote: v }) }); } catch { /* */ }
  }
  return (
    <span style={{ display: "inline-flex", gap: 6, marginLeft: "auto", alignItems: "center" }} onClick={(e) => e.preventDefault()}>
      {voted ? (
        <span style={{ fontSize: 11.5, color: voted === "confirm" ? "var(--green)" : "var(--muted)" }}>
          {voted === "confirm" ? "Thanks — confirmed ✓" : "Thanks — flagged"}
        </span>
      ) : (
        <>
          <button onClick={() => vote("confirm")} title="Still here" style={{ font: "inherit", fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999, border: "1px solid var(--line)", background: "#fff", color: "var(--green)", cursor: "pointer" }}>Still here</button>
          <button onClick={() => vote("flag")} title="Gone / wrong" style={{ font: "inherit", fontSize: 11.5, fontWeight: 600, padding: "3px 8px", borderRadius: 999, border: "1px solid var(--line)", background: "#fff", color: "var(--muted)", cursor: "pointer" }}>Gone</button>
        </>
      )}
    </span>
  );
}
