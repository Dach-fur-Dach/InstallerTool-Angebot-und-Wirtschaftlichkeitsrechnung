"use client";

import Image from "next/image";
import { fmt1, fmt2, fmtInt } from "@/lib/calculator";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronIcon } from "@/components/ui/Icons";

const Row = ({ label, value }: { label: string; value: string }) => (
  <>
    <div className="text-[#5B6472]">{label}</div>
    <div className="text-right font-bold text-[#1B2A3A]">{value}</div>
  </>
);

export function ImmobilieSection({ calc, printMode = false }: { calc: MieterstromCalculator; printMode?: boolean }) {
  const { results: r, sectionOpen, toggleSection } = calc;
  const open = printMode || sectionOpen.immobilie;

  return (
    <div className="mb-5 overflow-hidden rounded-[10px] border border-[#EDF1F6] break-inside-avoid">
      <div
        onClick={printMode ? undefined : () => toggleSection("immobilie")}
        className={`flex items-center gap-2.5 bg-[#F7FAFC] px-3.5 py-2.5 select-none ${printMode ? "" : "cursor-pointer"}`}
      >
        <Image src="/icon-house-solar.png" alt="" width={22} height={22} className="h-[22px] w-[22px]" />
        <h3 className="m-0 flex-1 text-[13px] font-bold tracking-wide text-[#1B2A3A] uppercase">
          Angaben zur Immobilie
        </h3>
        {!printMode && (
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF2FF] text-[#3AA8DC]">
            <ChevronIcon style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }} />
          </span>
        )}
      </div>

      <Collapse open={open} printMode={printMode} innerClassName="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 p-3.5 text-[12.5px]">
        <Row label="Wohneinheiten" value={fmtInt(r.einheiten)} />
        <Row label="Verbrauch Mieterstrom" value={`${fmt2(r.verbrauchMieterstrom)} kWh`} />
        <Row label="Verbrauch Wärmepumpe" value={r.wpOwnMeter ? `${fmt2(r.wpVerbrauch)} kWh` : "–"} />
        <Row label="PV-Anlage" value={`${fmt1(r.pvGroesse)} kWp`} />
        <Row label="PV-Speicher" value={`${fmt2(r.speicher)} kWh`} />
        <Row label="PV-Erzeugung" value={`${fmt2(r.pvErtrag)} kWh`} />
        <Row label="Eigenverbrauch Mieterstrom" value={`${fmt2(r.eigenverbrauchMieterstrom)} kWh`} />
        <Row label="Netzstrombedarf (Wohnungen)" value={`${fmt2(r.netzMieterstrom)} kWh`} />
        <Row label="Eigenverbrauch (Wärmepumpe)" value={r.wpOwnMeter ? `${fmt2(r.eigenverbrauchWP)} kWh` : "–"} />
        <Row label="Netzstrombedarf (Wärmepumpe)" value={r.wpOwnMeter ? `${fmt2(r.netzWP)} kWh` : "–"} />
        <Row label="Überschusseinspeisung" value={`${fmt2(r.ueberschusseinspeisung)} kWh`} />
      </Collapse>

      <div className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 border-t border-[#EDF1F6] px-3.5 py-3 text-[12.5px]">
        <Row label="Eigenverbrauchsquote" value={`${fmt1(r.eigenverbrauchsquote)} %`} />
        <Row label="Autarkiegrad" value={`${fmt1(r.autarkiegrad)} %`} />
      </div>
    </div>
  );
}
