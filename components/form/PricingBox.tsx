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
      <div className="mb-1.5 text-[11.5px] font-bold tracking-wide text-[#5B6472] uppercase">Mieterstrom</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel
            label="PV-Strompreis / kWh (€)"
            info="Preis, den die Mieter pro kWh Solarstrom aus der PV-Anlage zahlen. Das ist der Tarif im Mieterstromvertrag, nicht der Preis für Netzstrom."
          />
          <NumberInput min={0} step={0.01} value={form.pvPreis} onChange={onNum("pvPreis")} />
        </div>
        <div>
          <FieldLabel
            label="Verkauf Netzstrompreis / kWh (€)"
            info="Preis, den die Mieter pro kWh Reststrom aus dem Netz zahlen, wenn die PV-Erzeugung nicht ausreicht. Fließt in Angebot und Einnahmenberechnung ein."
          />
          <NumberInput min={0} step={0.01} value={form.netzPreis} onChange={onNum("netzPreis")} />
        </div>
        <div>
          <FieldLabel
            label="Einkauf Netzstrompreis / kWh (€)"
            info="Preis, den der Betreiber selbst pro kWh für zugekauften Netzstrom zahlt. Fließt als Kostenposition in die Wirtschaftlichkeitsberechnung ein."
          />
          <NumberInput min={0} step={0.01} value={form.netzPreisEinkauf} onChange={onNum("netzPreisEinkauf")} />
        </div>
        <div>
          <FieldLabel
            label="Grundgebühr (€/Monat)"
            info="Monatliche Grundgebühr, die die Mieter zusätzlich zum Arbeitspreis zahlen, unabhängig vom Verbrauch."
          />
          <NumberInput min={0} step={0.1} value={form.grundgebuehr} onChange={onNum("grundgebuehr")} />
        </div>
        <div>
          <FieldLabel
            label="Strompreissteigerung p.a. (%)"
            info="Jährliche Preissteigerung, mit der die Solar- und Netzstrom-Erlöse sowie der Reststrom-Einkauf in der 20-Jahres-Wirtschaftlichkeitsrechnung hochgerechnet werden. Pauschale Gebühren bleiben davon unberührt."
          />
          <NumberInput min={0} step={0.5} value={form.strompreisSteigerung} onChange={onNum("strompreisSteigerung")} />
        </div>
      </div>

      <div className="my-1 mb-3.5 mt-[18px] h-px bg-[#EDF1F6]" />

      <div className="mb-1.5 text-[11.5px] font-bold tracking-wide text-[#5B6472] uppercase">
        Grundversorger (Vergleich)
      </div>
      <div className="mb-3 text-[11px] text-[#98A2B3]">Einkaufspreis € pro kWh + Grundgebühr</div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <FieldLabel
            label="Grundversorger (€/kWh)"
            info="Vergleichspreis des örtlichen Grundversorgers. Dient nur als Referenzwert, um die Ersparnis der Mieter im Vergleich zum Grundversorgertarif darzustellen."
          />
          <NumberInput min={0} step={0.01} value={form.grundversorgerPreis} onChange={onNum("grundversorgerPreis")} />
        </div>
        <div>
          <FieldLabel
            label="Grundversorger Grundgebühr (€/Monat)"
            info="Monatliche Grundgebühr des Grundversorgers, ebenfalls nur als Vergleichswert für die Ersparnisdarstellung."
          />
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
