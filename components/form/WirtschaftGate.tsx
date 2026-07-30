"use client";

import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function WirtschaftGate({ calc }: { calc: MieterstromCalculator }) {
  const { wirtschaftBenoetigt, setWirtschaftBenoetigt } = calc;
  const base = "cursor-pointer rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold";
  const active = "border border-[#3AA8DC] bg-[#3AA8DC] text-white font-bold";
  const inactive = "border border-[#D0D5DD] bg-white text-[#667085]";

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-[#E5EAF1] bg-white px-6 py-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <span className="text-sm font-bold text-[#0A1628]">Wirtschaftlichkeitsrechnung benötigt?</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setWirtschaftBenoetigt("nein")}
          className={`${base} ${wirtschaftBenoetigt === "nein" ? active : inactive}`}
        >
          Nein
        </button>
        <button
          type="button"
          onClick={() => setWirtschaftBenoetigt("ja")}
          className={`${base} ${wirtschaftBenoetigt === "ja" ? active : inactive}`}
        >
          Ja
        </button>
      </div>
    </div>
  );
}
