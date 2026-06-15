"use client";
import { useState, useMemo } from "react";
import type { Buffet } from "@/lib/buffets";

type Sort = "value" | "dinner" | "name";
const fromPrice = (b: Buffet) => Math.min(...[b.brunch, b.dinner].filter((x): x is number => x != null));
const money = (n: number | null) => (n == null ? "—" : "$" + n);

export default function BuffetTable({ buffets }: { buffets: Buffet[] }) {
  const [sort, setSort] = useState<Sort>("value");
  const [area, setArea] = useState<"all" | "Strip" | "Downtown" | "Off-Strip">("all");

  const rows = useMemo(() => {
    let r = buffets.filter((b) => area === "all" || b.area === area);
    return [...r].sort((a, b) => {
      if (sort === "value") return fromPrice(a) - fromPrice(b);
      if (sort === "dinner") return (a.dinner ?? 9999) - (b.dinner ?? 9999);
      return a.name.localeCompare(b.name);
    });
  }, [buffets, sort, area]);

  const Chip = ({ on, onClick, children }: any) => (
    <button onClick={onClick} className={`chip ${on ? "on" : ""}`} style={{ cursor: "pointer" }}>{children}</button>
  );

  return (
    <>
      <div className="chips" style={{ marginBottom: 8 }}>
        {(["all", "Strip", "Downtown", "Off-Strip"] as const).map((a) => (
          <Chip key={a} on={area === a} onClick={() => setArea(a)}>{a === "all" ? "All areas" : a}</Chip>
        ))}
      </div>
      <div className="chips" style={{ marginBottom: 14 }}>
        <Chip on={sort === "value"} onClick={() => setSort("value")}>Cheapest first</Chip>
        <Chip on={sort === "dinner"} onClick={() => setSort("dinner")}>By dinner price</Chip>
        <Chip on={sort === "name"} onClick={() => setSort("name")}>A–Z</Chip>
      </div>

      <div className="list">
        {rows.map((b, i) => (
          <div key={b.name} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div className="c-name" style={{ fontSize: 16 }}>{i === 0 && sort === "value" ? "🏆 " : ""}{b.name}</div>
                <div className="c-type" style={{ marginTop: 2 }}>{b.hotel} · {b.area} · {b.bestFor}</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{money(b.brunch)}<span className="c-type" style={{ fontSize: 11, fontWeight: 400 }}> brunch</span></div>
                <div className="c-type" style={{ fontSize: 12 }}>{b.dinner != null ? `${money(b.dinner)} dinner` : "no dinner"}</div>
              </div>
            </div>
            {b.note && <div className="c-type" style={{ marginTop: 5, fontSize: 12 }}>{b.note}</div>}
          </div>
        ))}
      </div>
    </>
  );
}
