"use client";
import { useEffect, useState } from "react";
export default function SaveButton({ id, name, compact }: { id: string; name: string; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem("vs_saved") || "{}"); setSaved(!!s[id]); } catch {} }, [id]);
  function toggle(e: any) {
    e.preventDefault(); e.stopPropagation();
    try { const s = JSON.parse(localStorage.getItem("vs_saved") || "{}"); if (s[id]) delete s[id]; else s[id] = { name, at: Date.now() }; localStorage.setItem("vs_saved", JSON.stringify(s)); setSaved(!!s[id]); } catch {}
  }
  return (
    <button className={"savebtn" + (saved ? " on" : "") + (compact ? " compact" : "")} onClick={toggle} aria-label={saved ? "Saved" : "Save"}>
      <svg viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.5-9.5 9-9.5 9z"/></svg>
      {!compact && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
