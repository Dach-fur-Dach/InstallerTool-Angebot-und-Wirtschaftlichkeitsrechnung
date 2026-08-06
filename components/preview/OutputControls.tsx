"use client";

import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function OutputControls({ calc }: { calc: MieterstromCalculator }) {
  const { outputs, toggleOutput } = calc;

  return (
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
      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={outputs.flyer}
          onChange={() => toggleOutput("flyer")}
          className="h-[17px] w-[17px] accent-[#3AA8DC]"
        />
        <span className="text-[13.5px] font-semibold text-[#0A1628]">Mieter-Flyer</span>
      </label>
    </div>
  );
}
