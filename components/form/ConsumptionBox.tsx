"use client";

import { CollapsibleBox } from "@/components/ui/CollapsibleBox";
import { AutoResetLink, InfoTooltip, NumberInput } from "@/components/ui/Field";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

function AutoField({
  label,
  value,
  isManual,
  onChange,
  onReset,
  info,
}: {
  label: string;
  value: number;
  isManual: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onReset: () => void;
  info?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-[#344054]">
        {label}
        {info && <InfoTooltip text={info} />}
        <AutoResetLink isManual={isManual} onReset={onReset} />
      </label>
      <NumberInput min={0} value={Math.round(value)} onChange={onChange} />
    </div>
  );
}

export function ConsumptionBox({ calc }: { calc: MieterstromCalculator }) {
  const {
    form,
    onNum,
    box4Open,
    setBox4Open,
    tier2VisualOpacity,
    results,
    resetAllgemeinManual,
    resetWohnungenManual,
    resetGewerbeManual,
    resetWallboxManual,
    resetDurchlauferhitzerManual,
    resetWaermepumpeManual,
  } = calc;

  return (
    <CollapsibleBox
      number={4}
      title="Verbrauch"
      open={box4Open}
      onToggle={() => setBox4Open(!box4Open)}
      opacity={tier2VisualOpacity}
    >
      <div className="grid grid-cols-2 gap-4">
        <AutoField
          label="Wohnungen (kWh)"
          info="1.850 kWh je Wohneinheit"
          value={results.verbrauchWohnungen}
          isManual={results.wohnungenIsManual}
          onChange={onNum("verbrauchWohnungenManual")}
          onReset={resetWohnungenManual}
        />
        <AutoField
          label="Allgemeinstrom (kWh)"
          value={results.autoAllgemein}
          isManual={results.allgemeinIsManual}
          onChange={onNum("verbrauchAllgemeinManual")}
          onReset={resetAllgemeinManual}
        />
        <AutoField
          label="Gewerbe (kWh)"
          info="3.500 kWh je Gewerbeeinheit"
          value={results.verbrauchGewerbe}
          isManual={results.gewerbeIsManual}
          onChange={onNum("verbrauchGewerbeManual")}
          onReset={resetGewerbeManual}
        />
        {form.waermepumpeModus === "eigener_zaehler" && (
          <AutoField
            label="Wärmepumpe (kWh)"
            info="1.250 kWh je Wohn- und Gewerbeeinheit"
            value={results.wpVerbrauch}
            isManual={results.waermepumpeIsManual}
            onChange={onNum("verbrauchWaermepumpe")}
            onReset={resetWaermepumpeManual}
          />
        )}
        {form.wallboxModus !== "nein" && (
          <AutoField
            label="Wallbox (kWh)"
            info="2.250 kWh je Wallbox (E-Auto)"
            value={results.verbrauchWallbox}
            isManual={results.wallboxIsManual}
            onChange={onNum("verbrauchWallboxManual")}
            onReset={resetWallboxManual}
          />
        )}
        {form.durchlauferhitzer && (
          <AutoField
            label="Durchlauferhitzer (kWh)"
            info="1.850 kWh je Durchlauferhitzer (Warmwasser)"
            value={results.verbrauchDurchlauferhitzer}
            isManual={results.durchlauferhitzerIsManual}
            onChange={onNum("verbrauchDurchlauferhitzerManual")}
            onReset={resetDurchlauferhitzerManual}
          />
        )}
      </div>
    </CollapsibleBox>
  );
}
