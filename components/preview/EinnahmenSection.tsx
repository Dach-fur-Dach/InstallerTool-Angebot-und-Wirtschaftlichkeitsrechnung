"use client";

import { fmtInt } from "@/lib/calculator";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { CollapsibleSection } from "./CollapsibleSection";

const Row = ({ label, detail, value }: { label: string; detail: string; value: string }) => (
  <div className="flex items-center justify-between border-b border-[#F1F4F8] py-[7px]">
    <div>
      <span className="font-semibold text-[#1B2A3A]">{label}</span>{" "}
      <span className="text-[10px] text-[#98A2B3]">{detail}</span>
    </div>
    <div className="font-bold text-[#1B2A3A]">{value}</div>
  </div>
);

export function EinnahmenSection({ calc }: { calc: MieterstromCalculator }) {
  const { form, results: r, sectionOpen, toggleSection } = calc;
  const fmt = (n: number) => n.toLocaleString("de-DE", { minimumFractionDigits: 2 });

  return (
    <CollapsibleSection
      title="Einnahmen mit Dach für Dach"
      valueLabel={`${fmtInt(r.einnahmen)} €`}
      valueColor="#1B6FA8"
      open={sectionOpen.einnahmen}
      onToggle={() => toggleSection("einnahmen")}
    >
      <Row label="Grundgebühr" detail={`${fmt(Number(form.grundgebuehr) || 0)}€ pro Einheit/Monat`} value={`${fmtInt(r.einnahmenGrundgebuehr)} €`} />
      <Row label="Solarstrom" detail={`${fmt(Number(form.pvPreis) || 0)}€ pro kWh`} value={`${fmtInt(r.einnahmenSolarstrom)} €`} />
      <Row label="Netzstrom" detail={`${fmt(Number(form.netzPreis) || 0)}€ pro kWh`} value={`${fmtInt(r.einnahmenNetzstrom)} €`} />
      <Row label="Einspeisevergütung" detail="0,08€ pro kWh" value={`${fmtInt(r.einnahmenEinspeisung)} €`} />
      <Row label="Mieterstromzuschlag" detail="0,021€ pro kWh (EEG)" value={`${fmtInt(r.einnahmenZuschlag)} €`} />
      <div className="mt-1.5 flex items-center justify-between rounded-lg bg-[#D6EAF5] px-3 py-2.5">
        <div className="font-bold text-[#1B2A3A]">Gesamteinnahmen</div>
        <div className="font-extrabold text-[#1B2A3A]">{fmtInt(r.einnahmen)} €</div>
      </div>
      <div className="flex items-center justify-between px-1 pt-3 pb-1">
        <div className="text-[13.5px] font-bold text-[#1B2A3A]">Überschuss im 1. Jahr</div>
        <div className="text-[15px] font-extrabold text-[#1B2A3A]">{fmtInt(r.gewinnJahr1)} €</div>
      </div>
    </CollapsibleSection>
  );
}
