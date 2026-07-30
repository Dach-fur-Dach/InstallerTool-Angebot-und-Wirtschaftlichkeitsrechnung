"use client";

import { CollapsibleBox } from "@/components/ui/CollapsibleBox";
import { FieldLabel, NumberInput, SelectInput } from "@/components/ui/Field";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function EnergySystemBox({ calc }: { calc: MieterstromCalculator }) {
  const { form, onNum, onText, box3Open, setBox3Open, tier2VisualOpacity, results, resetErtragManual, wpDisabled } =
    calc;

  return (
    <CollapsibleBox
      number={3}
      title="Energiesystem"
      open={box3Open}
      onToggle={() => setBox3Open(!box3Open)}
      opacity={tier2VisualOpacity}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="PV-Anlage (kWp)" />
          <div className="flex items-center gap-2.5">
            <NumberInput min={0} step={0.5} value={form.pvGroesse} onChange={onNum("pvGroesse")} />
            <span className="text-[11px] font-semibold whitespace-nowrap text-[#667085]">Ø</span>
            <input
              type="number"
              min={0}
              value={Math.round(results.ertragProKwp)}
              onChange={onNum("ertragProKwpManual")}
              title="Ertrag pro kWp überschreiben"
              className="w-[60px] box-border rounded-md border border-[#D0D5DD] px-[7px] py-1.5 text-right text-xs font-semibold text-[#344054]"
            />
            <span className="text-[11px] font-semibold whitespace-nowrap text-[#667085]">kWh/kWp</span>
            {results.ertragIsManual && (
              <a
                onClick={resetErtragManual}
                className="cursor-pointer text-[10.5px] font-bold whitespace-nowrap text-[#3AA8DC]"
              >
                zurücksetzen
              </a>
            )}
          </div>
        </div>
        <div>
          <FieldLabel label="Speicher (kWh)" />
          <NumberInput min={0} value={form.speicher} onChange={onNum("speicher")} />
        </div>
        <div>
          <FieldLabel label="PV-Szenario" />
          <SelectInput value={form.pvSzenario} onChange={onText("pvSzenario")}>
            <option value="steildach">Steildach Süd 35°</option>
            <option value="flachdach">Flachdach Ost-West</option>
          </SelectInput>
        </div>
        <div>
          <FieldLabel label="WP-Szenario" />
          <SelectInput disabled={wpDisabled} value={form.wpSzenario} onChange={onText("wpSzenario")}>
            <option value="ungesteuert">Ungesteuert (temperaturabhängig)</option>
            <option value="pv_optimiert">PV-optimiert</option>
          </SelectInput>
        </div>
      </div>
    </CollapsibleBox>
  );
}
