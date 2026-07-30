"use client";

import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function OutputControls({ calc }: { calc: MieterstromCalculator }) {
  const { outputs, toggleOutput } = calc;
  const anyOutput = outputs.wirtschaft || outputs.angebot;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-[#E5EAF1] bg-white px-5 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex flex-wrap items-center gap-5">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={outputs.angebot}
            onChange={() => toggleOutput("angebot")}
            className="h-[17px] w-[17px] accent-[#3AA8DC]"
          />
          <span className="text-[13.5px] font-semibold text-[#0A1628]">Angebot</span>
        </label>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={outputs.wirtschaft}
            onChange={() => toggleOutput("wirtschaft")}
            className="h-[17px] w-[17px] accent-[#3AA8DC]"
          />
          <span className="text-[13.5px] font-semibold text-[#0A1628]">Wirtschaftlichkeit</span>
        </label>
      </div>
      <button
        type="button"
        disabled={!anyOutput}
        title={anyOutput ? "PDF mit den ausgewählten Inhalten erstellen" : "Bitte mindestens einen Inhalt auswählen"}
        className={
          anyOutput
            ? "whitespace-nowrap rounded-[10px] border-none bg-[#3AA8DC] px-[22px] py-[11px] text-sm font-bold text-white shadow-[0_2px_6px_rgba(46,155,214,0.3)] cursor-pointer"
            : "whitespace-nowrap rounded-[10px] border-none bg-[#E5EAF1] px-[22px] py-[11px] text-sm font-bold text-[#98A2B3] cursor-not-allowed"
        }
      >
        PDF erstellen
      </button>
    </div>
  );
}
