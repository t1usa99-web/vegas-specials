"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBox({ initial = "", autoFocus = false }: { initial?: string; autoFocus?: boolean }) {
  const [q, setQ] = useState(initial);
  const router = useRouter();
  function go() { const t = q.trim(); if (t.length >= 2) router.push(`/search?q=${encodeURIComponent(t)}`); }
  return (
    <div className="search" style={{ marginTop: 0 }}>
      <div className="box">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
        <input autoFocus={autoFocus} value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()}
          placeholder="Search venues, deals, events, neighborhoods…" />
      </div>
    </div>
  );
}
