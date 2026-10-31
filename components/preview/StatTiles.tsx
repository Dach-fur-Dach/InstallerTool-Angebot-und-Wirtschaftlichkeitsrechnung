"use client";

import { fmt1, fmtInt } from "@/lib/calculator";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

// `compact` is the mini version shown on the Angebot (Leistungsübersicht) card.
export function StatTiles({ calc, compact = false }: { calc: MieterstromCalculator; compact?: boolean }) {
  const { results: r } = calc;
  const tile = compact ? "rounded-lg bg-[#D6EAF5] px-2.5 py-2" : "rounded-xl bg-[#3AA8DC] p-3.5";
  const label = compact
    ? "mb-0.5 text-[9.5px] font-semibold text-[#3A6F8F]"
    : "mb-1.5 text-[10.5px] font-semibold text-white/85";
  const value = compact
    ? "text-[15px] font-extrabold tracking-tight text-[#1B2A3A]"
    : "text-xl font-extrabold tracking-tight text-white";

  return (
    <div className={`grid grid-cols-3 break-inside-avoid ${compact ? "gap-2" : "gap-2.5"}`}>
      <div className={tile}>
        <div className={label}>Rendite p.a.</div>
        <div className={value}>{fmt1(r.rendite)}%</div>
      </div>
      <div className={tile}>
        <div className={label}>Amortisation</div>
        <div className={value}>
          {isFinite(r.amortisation) ? fmt1(r.amortisation) : "—"}{" "}
          <span className={compact ? "text-[10px] font-semibold" : "text-[11px] font-semibold"}>J.</span>
        </div>
      </div>
      <div className={tile}>
        <div className={label}>Gewinn im 1. Jahr</div>
        <div className={value}>{fmtInt(r.gewinnJahr1)} €</div>
      </div>
    </div>
  );
}

// Shown at the very bottom of the Wirtschaftlichkeitsrechnung (below "Gewinn nach 20 Jahren").
export function Co2Tile({ calc }: { calc: MieterstromCalculator }) {
  const { results: r } = calc;

  return (
    <div className="mt-2.5 flex items-center justify-between rounded-xl bg-[#F2D9A6] p-3.5 break-inside-avoid">
      <div>
        <div className="mb-1 text-[10.5px] font-bold text-[#5C4A24]">CO2-Ersparnis pro Jahr</div>
        <div className="text-xl font-extrabold text-[#1B2A3A]">{fmt1(r.co2)} t</div>
      </div>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8A6A2E" strokeWidth={1.5}>
        <circle cx="12" cy="12" r="9" strokeLinecap="round" />
        <path d="M8 13c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5" strokeLinecap="round" />
        <path d="M9.5 15.5h5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
