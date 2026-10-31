"use client";

import { CollapsibleBox } from "@/components/ui/CollapsibleBox";
import { AutoResetLink, FieldLabel, NumberInput, SelectInput } from "@/components/ui/Field";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

function CostOverrideField({
  label,
  value,
  isManual,
  onChange,
  onReset,
}: {
  label: string;
  value: number;
  isManual: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#344054]">
        {label}
        <AutoResetLink isManual={isManual} onReset={onReset} />
      </label>
      <NumberInput min={0} value={Math.round(value)} onChange={onChange} />
    </div>
  );
}

export function EnergySystemBox({ calc }: { calc: MieterstromCalculator }) {
  const {
    form,
    onNum,
    onText,
    box3Open,
    setBox3Open,
    tier2VisualOpacity,
    results,
    resetErtragManual,
    resetPvGroesseManual,
    resetSpeicherManual,
    resetKostenPVManual,
    resetKostenSpeicherManual,
    resetKostenZaehlerschrankManual,
    wpDisabled,
  } = calc;

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
          <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#344054]">
            PV-Anlage (kWp)
            <AutoResetLink isManual={results.pvGroesseIsManual} onReset={resetPvGroesseManual} />
          </label>
          <div className="flex items-center gap-2.5">
            <NumberInput
              min={0}
              step={0.5}
              value={Math.round(results.pvGroesse * 10) / 10}
              onChange={onNum("pvGroesseManual")}
            />
            <span className="text-[11px] font-semibold whitespace-nowrap text-[#667085]">Ø</span>
            <div className="w-[76px] shrink-0">
              <NumberInput
                min={0}
                value={Math.round(results.ertragProKwp)}
                onChange={onNum("ertragProKwpManual")}
                title="Ertrag pro kWp überschreiben"
                className="text-right text-xs font-semibold"
              />
            </div>
            <span className="text-[11px] font-semibold whitespace-nowrap text-[#667085]">kWh/kWp</span>
            <AutoResetLink isManual={results.ertragIsManual} onReset={resetErtragManual} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#344054]">
            Speicher (kWh)
            <AutoResetLink isManual={results.speicherIsManual} onReset={resetSpeicherManual} />
          </label>
          <NumberInput min={0} value={Math.round(results.speicher)} onChange={onNum("speicherManual")} />
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

      <div className="my-1 mb-[18px] h-px bg-[#EDF1F6]" />

      <div className="mb-1.5 text-[11.5px] font-bold tracking-wide text-[#5B6472] uppercase">Investitionskosten</div>
      <div className="grid grid-cols-2 gap-4">
        <CostOverrideField
          label="PV-Anlage (€)"
          value={results.kostenPV}
          isManual={results.kostenPVIsManual}
          onChange={onNum("kostenPVManual")}
          onReset={resetKostenPVManual}
        />
        <CostOverrideField
          label="Speicher (€)"
          value={results.kostenSpeicher}
          isManual={results.kostenSpeicherIsManual}
          onChange={onNum("kostenSpeicherManual")}
          onReset={resetKostenSpeicherManual}
        />
        <div className="col-span-2">
          <CostOverrideField
            label="Zählerschrank / Wandlermessung (€)"
            value={results.kostenZaehlerschrank}
            isManual={results.kostenZaehlerschrankIsManual}
            onChange={onNum("kostenZaehlerschrankManual")}
            onReset={resetKostenZaehlerschrankManual}
          />
        </div>
      </div>
    </CollapsibleBox>
  );
}
