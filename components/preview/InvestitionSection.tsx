"use client";

import { fmtInt } from "@/lib/calculator";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { CollapsibleSection } from "./CollapsibleSection";

const Row = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div
    className={
      highlight
        ? "mt-1.5 flex items-center justify-between rounded-lg bg-[#FFEABF] px-3 py-2.5"
        : "flex items-center justify-between border-b border-[#F1F4F8] py-[7px]"
    }
  >
    <div>
      <span className={highlight ? "font-bold text-[#1B2A3A]" : "font-semibold text-[#1B2A3A]"}>{label}</span>
      {!highlight && <span className="ml-1 text-[10px] text-[#98A2B3]">geschätzt</span>}
    </div>
    <div className={highlight ? "font-extrabold text-[#1B2A3A]" : "font-bold text-[#1B2A3A]"}>{value}</div>
  </div>
);

export function InvestitionSection({ calc, printMode = false }: { calc: MieterstromCalculator; printMode?: boolean }) {
  const { results: r, sectionOpen, toggleSection } = calc;

  return (
    <CollapsibleSection
      icon="/icon-calculator.png"
      title="Investitionskosten"
      valueLabel={`${fmtInt(r.investition)} €`}
      open={sectionOpen.investition}
      onToggle={() => toggleSection("investition")}
      printMode={printMode}
    >
      <Row label="PV-Anlage" value={`${fmtInt(r.kostenPV)} €`} />
      <Row label="Speicher" value={`${fmtInt(r.kostenSpeicher)} €`} />
      <Row label="Zählerschrank/Wandlermessung" value={`${fmtInt(r.kostenZaehlerschrank)} €`} />
      <Row label="Mieterstrompaket" value={`${fmtInt(r.kostenMieterstrompaket)} €`} />
      <Row label="Gesamtinvestitionskosten" value={`${fmtInt(r.investition)} €`} highlight />
    </CollapsibleSection>
  );
}
