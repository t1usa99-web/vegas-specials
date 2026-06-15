"use client";
import { useState, useMemo } from "react";
import type { Hotel } from "@/lib/resortFees";
import { TAX } from "@/lib/resortFees";

type Sort = "fee_asc" | "fee_desc" | "free" | "name";
const money = (n: number) => (n % 1 === 0 ? "$" + n : "$" + n.toFixed(2));

export default function ResortFeeTable({ hotels }: { hotels: Hotel[] }) {
  const [sort, setSort] = useState<Sort>("fee_asc");
  const [area, setArea] = useState<"all" | "Strip" | "Downtown" | "Off-Strip">("all");

  const rows = useMemo(() => {
    let r = hotels.filter((h) => area === "all" || h.area === area);
    r = [...r].sort((a, b) => {
      if (sort === "fee_asc") return a.fee - b.fee || a.hotel.localeCompare(b.hotel);
      if (sort === "fee_desc") return b.fee - a.fee || a.hotel.localeCompare(b.hotel);
      if (sort === "free") return (Number(b.parkFree) - Number(a.parkFree)) || a.fee - b.fee;
      return a.hotel.localeCompare(b.hotel);
    });
    return r;
  }, [hotels, sort, area]);

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
        <Chip on={sort === "fee_asc"} onClick={() => setSort("fee_asc")}>Lowest fee</Chip>
        <Chip on={sort === "fee_desc"} onClick={() => setSort("fee_desc")}>Highest fee</Chip>
        <Chip on={sort === "free"} onClick={() => setSort("free")}>Free parking first</Chip>
        <Chip on={sort === "name"} onClick={() => setSort("name")}>A–Z</Chip>
      </div>

      <div className="list">
        {rows.map((h) => {
          const total = h.fee * (1 + TAX);
          return (
            <div key={h.hotel} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div className="c-name" style={{ fontSize: 16 }}>{h.hotel}</div>
                <div className="c-type" style={{ marginTop: 3 }}>
                  {h.area}{h.group ? ` · ${h.group}` : ""} ·{" "}
                  {h.parkFree ? <span style={{ color: "#0f8a5f", fontWeight: 600 }}>Free parking</span>
                    : <span style={{ color: "#b0357a" }}>Paid parking{h.selfPark ? ` ~${money(h.selfPark)}` : ""}</span>}
                  {h.note ? ` · ${h.note}` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: h.fee === 0 ? "#0f8a5f" : "var(--text)" }}>
                  {h.fee === 0 ? "No fee" : money(h.fee)}
                </div>
                {h.fee > 0 && <div className="c-type" style={{ fontSize: 11 }}>~{money(Math.round(total))} with tax</div>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
