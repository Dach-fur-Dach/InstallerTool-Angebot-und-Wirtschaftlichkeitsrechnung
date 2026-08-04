"use client";

import { fmt2, fmtInt } from "@/lib/calculator";
import type { BetriebOpenState, MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronIcon } from "@/components/ui/Icons";
import { CollapsibleSection } from "./CollapsibleSection";

function useDetails(calc: MieterstromCalculator): Record<keyof BetriebOpenState, string> {
  const { form } = calc;
  return {
    versicherung: "1,2% der Investition",
    abrechnung: "Wie im Angebot (Abrechnung Standard)",
    netzstrom: `${fmt2(Number(form.netzPreisEinkauf) || 0)}€ Einkaufspreis pro kWh`,
    zaehler: "Wie im Angebot (Zählergebühren)",
  };
}

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
  const details = useDetails(calc);
  return (
    <div className="border-b border-[#F1F4F8] py-[7px]">
      <div onClick={() => toggleBetrieb(detailKey)} className="flex cursor-pointer items-center justify-between">
        <span className="flex items-center gap-1.5 font-semibold text-[#1B2A3A]">
          {label}
          <ChevronIcon
            className="text-[#98A2B3]"
            style={{ transform: betriebOpen[detailKey] ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
          />
        </span>
        <span className="font-bold text-[#1B2A3A]">{value}</span>
      </div>
      <Collapse open={betriebOpen[detailKey]} innerClassName="mt-1 text-[10px] text-[#98A2B3]">
        {details[detailKey]}
      </Collapse>
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
      <ToggleRow label="Kosten Netzstrom" value={`${fmtInt(r.betriebNetzstrom)} €`} detailKey="netzstrom" calc={calc} />
      <ToggleRow label="Zähler (Jahresgebühr)" value={`${fmtInt(r.betriebZaehler)} €`} detailKey="zaehler" calc={calc} />
      <div className="mt-1.5 flex items-center justify-between rounded-lg bg-[#FFE9BF] px-3 py-2.5">
        <div className="font-bold text-[#1B2A3A]">Gesamtbetriebskosten</div>
        <div className="font-extrabold text-[#1B2A3A]">{fmtInt(r.betrieb)} €</div>
      </div>
    </CollapsibleSection>
  );
}
