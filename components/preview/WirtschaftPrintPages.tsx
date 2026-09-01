"use client";

import { MODELL_LABEL, fmtInt } from "@/lib/calculator";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { AmortisationChart } from "./AmortisationChart";
import { BetriebskostenSection } from "./BetriebskostenSection";
import { EinnahmenSection } from "./EinnahmenSection";
import { ImmobilieSection } from "./ImmobilieSection";
import { InvestitionSection } from "./InvestitionSection";
import { StatTiles } from "./StatTiles";

function Page1({ calc }: { calc: MieterstromCalculator }) {
  const { form } = calc;
  const messkonzeptLabel = MODELL_LABEL[form.mieterstromModell] ?? "GGV";
  const kundeDisplay = form.kunde ? form.kunde : "Kunde noch nicht angegeben";

  return (
    <>
      <h1 className="m-0 text-[15px] font-extrabold text-[#1B2A3A]">Ihre individuelle Wirtschaftlichkeitsrechnung</h1>
      <div className="mt-[3px] mb-4 text-xs font-medium text-[#5B6472]">Messkonzept: Mieterstrom ({messkonzeptLabel})</div>

      <div className="mb-[18px] rounded-[10px] bg-[#F7FAFC] px-3.5 py-3 text-[12.5px] leading-relaxed text-[#344054]">
        <div className="font-bold text-[#1B2A3A]">{kundeDisplay}</div>
        <div>{form.objektStrasse}</div>
        <div>{form.objektPlzStadt}</div>
      </div>

      <ImmobilieSection calc={calc} printMode />
      <StatTiles calc={calc} />
    </>
  );
}

function Page2({ calc }: { calc: MieterstromCalculator }) {
  return (
    <>
      <AmortisationChart calc={calc} />
      <InvestitionSection calc={calc} printMode />
      <BetriebskostenSection calc={calc} printMode />
    </>
  );
}

function Page3({ calc }: { calc: MieterstromCalculator }) {
  const { results: r } = calc;

  return (
    <>
      <EinnahmenSection calc={calc} printMode />
      <div className="mt-[22px] rounded-[14px] bg-[#3AA8DC] px-[22px] py-5">
        <div className="mb-1.5 text-[12.5px] font-semibold text-white/85">Gewinn nach 20 Jahren</div>
        <div className="text-[28px] font-extrabold tracking-tight text-white">{fmtInt(r.gewinn20)} €</div>
        <div className="mt-2 text-[11px] text-white/80 italic">
          Die Berechnungen basieren auf einer angenommenen Strompreissteigerung von{" "}
          {r.steigerungProzent.toLocaleString("de-DE")}% pro Jahr.
        </div>
      </div>
    </>
  );
}

export function wirtschaftPrintPages(calc: MieterstromCalculator) {
  return [<Page1 key="wirtschaft-1" calc={calc} />, <Page2 key="wirtschaft-2" calc={calc} />, <Page3 key="wirtschaft-3" calc={calc} />];
}
