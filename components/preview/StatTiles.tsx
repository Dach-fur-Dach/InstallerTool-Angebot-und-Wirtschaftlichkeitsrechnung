"use client";

import { fmt1, fmtInt } from "@/lib/calculator";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function StatTiles({ calc }: { calc: MieterstromCalculator }) {
  const { results: r } = calc;

  return (
    <>
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-xl bg-[#3AA8DC] p-3.5">
          <div className="mb-1.5 text-[10.5px] font-semibold text-white/85">Rendite p.a.</div>
          <div className="text-xl font-extrabold tracking-tight text-white">{fmt1(r.rendite)}%</div>
        </div>
        <div className="rounded-xl bg-[#3AA8DC] p-3.5">
          <div className="mb-1.5 text-[10.5px] font-semibold text-white/85">Amortisation</div>
          <div className="text-xl font-extrabold tracking-tight text-white">
            {isFinite(r.amortisation) ? fmt1(r.amortisation) : "—"} <span className="text-[11px] font-semibold">J.</span>
          </div>
        </div>
        <div className="rounded-xl bg-[#3AA8DC] p-3.5">
          <div className="mb-1.5 text-[10.5px] font-semibold text-white/85">Gewinn im 1. Jahr</div>
          <div className="text-xl font-extrabold tracking-tight text-white">{fmtInt(r.gewinnJahr1)} €</div>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-between rounded-xl bg-[#F2D9A6] p-3.5">
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
    </>
  );
}
