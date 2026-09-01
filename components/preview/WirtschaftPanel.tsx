"use client";

import { MODELL_LABEL, fmtInt } from "@/lib/calculator";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { Collapse } from "@/components/ui/Collapse";
import { AmortisationChart } from "./AmortisationChart";
import { BetriebskostenSection } from "./BetriebskostenSection";
import { EinnahmenSection } from "./EinnahmenSection";
import { ImmobilieSection } from "./ImmobilieSection";
import { InvestitionSection } from "./InvestitionSection";
import { StatTiles } from "./StatTiles";

export function WirtschaftPanel({ calc, printMode = false }: { calc: MieterstromCalculator; printMode?: boolean }) {
  const { form, results: r, loading, wirtschaftPanelOpen, setWirtschaftPanelOpen } = calc;
  const messkonzeptLabel = MODELL_LABEL[form.mieterstromModell] ?? "GGV";
  const dashboardOpacity = loading ? 0.55 : 1;
  const kundeDisplay = form.kunde ? form.kunde : "Kunde noch nicht angegeben";
  const isOpen = printMode ? true : wirtschaftPanelOpen;

  return (
    <div className="dfd-print-card overflow-hidden rounded-2xl border border-[#E5EAF1] bg-[#FCFBF9] shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      <div
        onClick={printMode ? undefined : () => setWirtschaftPanelOpen(!wirtschaftPanelOpen)}
        className={`flex items-center justify-between px-6 py-[18px] ${printMode ? "" : "cursor-pointer"}`}
      >
        <div>
          <h1 className="m-0 text-[15px] font-extrabold text-[#1B2A3A]">Ihre individuelle Wirtschaftlichkeitsrechnung</h1>
          {isOpen && (
            <div className="mt-[3px] text-xs font-medium text-[#5B6472]">Messkonzept: Mieterstrom ({messkonzeptLabel})</div>
          )}
        </div>
        {!printMode && <span className="text-[13px] font-bold text-[#98A2B3]">{wirtschaftPanelOpen ? "−" : "+"}</span>}
      </div>

      <Collapse open={isOpen} printMode={printMode} innerClassName="px-7 pb-7">
        {loading && (
          <div className="mb-2 flex items-center gap-2 text-[11.5px] font-semibold text-[#3AA8DC]">
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[rgba(46,155,214,0.25)] border-t-[#3AA8DC]" />
            Aktualisiere…
          </div>
        )}

        <div className="mb-[18px] rounded-[10px] bg-[#F7FAFC] px-3.5 py-3 text-[12.5px] leading-relaxed text-[#344054]">
          <div className="font-bold text-[#1B2A3A]">{kundeDisplay}</div>
          <div>{form.objektStrasse}</div>
          <div>{form.objektPlzStadt}</div>
        </div>

        <div style={{ opacity: dashboardOpacity, transition: "opacity 0.25s ease" }}>
          <ImmobilieSection calc={calc} printMode={printMode} />
          <StatTiles calc={calc} />
          <AmortisationChart calc={calc} />
          <InvestitionSection calc={calc} printMode={printMode} />
          <BetriebskostenSection calc={calc} printMode={printMode} />
          <EinnahmenSection calc={calc} printMode={printMode} />
        </div>

        <div
          className="mt-[22px] rounded-[14px] bg-[#3AA8DC] px-[22px] py-5 break-inside-avoid"
          style={{ opacity: dashboardOpacity, transition: "opacity 0.25s ease" }}
        >
          <div className="mb-1.5 text-[12.5px] font-semibold text-white/85">Gewinn nach 20 Jahren</div>
          <div className="text-[28px] font-extrabold tracking-tight text-white">{fmtInt(r.gewinn20)} €</div>
          <div className="mt-2 text-[11px] text-white/80 italic">
            Die Berechnungen basieren auf einer angenommenen Strompreissteigerung von{" "}
            {r.steigerungProzent.toLocaleString("de-DE")}% pro Jahr.
          </div>
        </div>
      </Collapse>
    </div>
  );
}
