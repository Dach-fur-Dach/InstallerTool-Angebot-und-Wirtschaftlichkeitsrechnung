"use client";

import { fmtInt } from "@/lib/calculator";
import type { BetriebOpenState, MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { CollapsibleSection } from "./CollapsibleSection";

const DETAILS: Record<keyof BetriebOpenState, string> = {
  versicherung: "1,2% der Investition",
  abrechnung: "60€ pro Einheit/Jahr",
  reststrom: "0,22€ pro kWh",
  zaehler: "120€ pro Zähler/Jahr",
};

function ToggleRow({
  label,
  value,
  detailKey,
  calc,
}: {
  label: string;
  value: string;
  detailKey: keyof BetriebOpenState;
  calc: MieterstromCalculator;
}) {
  const { betriebOpen, toggleBetrieb } = calc;
  return (
    <div className="border-b border-[#F1F4F8] py-[7px]">
      <div onClick={() => toggleBetrieb(detailKey)} className="flex cursor-pointer items-center justify-between">
        <span className="font-semibold text-[#1B2A3A]">{label} ⌄</span>
        <span className="font-bold text-[#1B2A3A]">{value}</span>
      </div>
      {betriebOpen[detailKey] && <div className="mt-1 text-[10px] text-[#98A2B3]">{DETAILS[detailKey]}</div>}
    </div>
  );
}

export function BetriebskostenSection({ calc }: { calc: MieterstromCalculator }) {
  const { results: r, sectionOpen, toggleSection } = calc;

  return (
    <CollapsibleSection
      title="Betriebskosten"
      valueLabel={`${fmtInt(r.betrieb)} €`}
      open={sectionOpen.betriebskosten}
      onToggle={() => toggleSection("betriebskosten")}
    >
      <ToggleRow label="Versicherung & Wartung" value={`${fmtInt(r.betriebVersicherung)} €`} detailKey="versicherung" calc={calc} />
      <ToggleRow label="Abrechnungskosten" value={`${fmtInt(r.betriebAbrechnung)} €`} detailKey="abrechnung" calc={calc} />
      <ToggleRow label="Kosten Reststrom" value={`${fmtInt(r.betriebReststrom)} €`} detailKey="reststrom" calc={calc} />
      <ToggleRow label="Zähler (Jahresgebühr)" value={`${fmtInt(r.betriebZaehler)} €`} detailKey="zaehler" calc={calc} />
      <div className="mt-1.5 flex items-center justify-between rounded-lg bg-[#FFE9BF] px-3 py-2.5">
        <div className="font-bold text-[#1B2A3A]">Gesamtbetriebskosten</div>
        <div className="font-extrabold text-[#1B2A3A]">{fmtInt(r.betrieb)} €</div>
      </div>
    </CollapsibleSection>
  );
}
