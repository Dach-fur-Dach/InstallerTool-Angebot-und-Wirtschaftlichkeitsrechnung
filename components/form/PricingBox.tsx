"use client";

import { CollapsibleBox } from "@/components/ui/CollapsibleBox";
import { FieldLabel, NumberInput } from "@/components/ui/Field";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function PricingBox({ calc }: { calc: MieterstromCalculator }) {
  const { form, onNum, box5Open, setBox5Open, tier2VisualOpacity } = calc;

  return (
    <CollapsibleBox
      number={5}
      title="Strompreise"
      open={box5Open}
      onToggle={() => setBox5Open(!box5Open)}
      opacity={tier2VisualOpacity}
    >
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel label="PV-Strompreis / kWh (€)" />
          <NumberInput min={0} step={0.01} value={form.pvPreis} onChange={onNum("pvPreis")} />
        </div>
        <div>
          <FieldLabel label="Netzstrompreis / kWh (€)" />
          <NumberInput min={0} step={0.01} value={form.netzPreis} onChange={onNum("netzPreis")} />
        </div>
        <div>
          <FieldLabel label="Grundgebühr (€/Monat)" />
          <NumberInput min={0} step={0.1} value={form.grundgebuehr} onChange={onNum("grundgebuehr")} />
        </div>
        <div>
          <FieldLabel label="Grundversorger (€/kWh)" />
          <NumberInput min={0} step={0.01} value={form.grundversorgerPreis} onChange={onNum("grundversorgerPreis")} />
        </div>
        <div>
          <FieldLabel label="Grundversorger Grundgebühr (€/Monat)" />
          <NumberInput
            min={0}
            step={0.1}
            value={form.grundversorgerGrundgebuehr}
            onChange={onNum("grundversorgerGrundgebuehr")}
          />
        </div>
      </div>
    </CollapsibleBox>
  );
}
