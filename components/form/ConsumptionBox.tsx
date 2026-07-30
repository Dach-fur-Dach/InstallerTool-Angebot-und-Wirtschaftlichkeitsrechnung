"use client";

import { CollapsibleBox } from "@/components/ui/CollapsibleBox";
import { FieldLabel, NumberInput } from "@/components/ui/Field";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function ConsumptionBox({ calc }: { calc: MieterstromCalculator }) {
  const { form, onNum, box4Open, setBox4Open, tier2VisualOpacity, results, resetAllgemeinManual, wpDisabled } = calc;

  return (
    <CollapsibleBox
      number={4}
      title="Verbrauch"
      open={box4Open}
      onToggle={() => setBox4Open(!box4Open)}
      opacity={tier2VisualOpacity}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="Wohnungen (kWh)" />
          <NumberInput min={0} value={form.verbrauchWohnungen} onChange={onNum("verbrauchWohnungen")} />
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#344054]">
            Allgemeinstrom (kWh){" "}
            <span className="rounded bg-[#EAF2FF] px-1.5 py-0.5 text-[9.5px] font-bold text-[#3AA8DC]">
              {results.allgemeinIsManual ? "MANUELL" : "AUTO"}
            </span>
            {results.allgemeinIsManual && (
              <a onClick={resetAllgemeinManual} className="cursor-pointer text-[10px] font-bold text-[#3AA8DC]">
                zurücksetzen
              </a>
            )}
          </label>
          <NumberInput
            min={0}
            value={Math.round(results.autoAllgemein)}
            onChange={onNum("verbrauchAllgemeinManual")}
          />
        </div>
        <div>
          <FieldLabel label="Gewerbe (kWh)" />
          <NumberInput min={0} value={form.verbrauchGewerbe} onChange={onNum("verbrauchGewerbe")} />
        </div>
        <div>
          <FieldLabel label="Wärmepumpe (kWh)" />
          <NumberInput min={0} disabled={wpDisabled} value={form.verbrauchWaermepumpe} onChange={onNum("verbrauchWaermepumpe")} />
        </div>
      </div>
    </CollapsibleBox>
  );
}
