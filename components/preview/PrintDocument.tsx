"use client";

import type { MieterstromCalculator, OutputKey } from "@/hooks/useMieterstromCalculator";
import { AngebotPanel } from "./AngebotPanel";
import { WirtschaftPanel } from "./WirtschaftPanel";
import { FlyerPanel } from "./FlyerPanel";
import { ProcessStepsPanel } from "./ProcessStepsPanel";
import { PrintPageHeader, PrintPageFooter } from "./PrintPageChrome";
import { PrintCoverPage } from "./PrintCoverPage";

const PAGE_PADDING = { padding: "14mm 12mm" };

export function PrintDocument({ calc }: { calc: MieterstromCalculator }) {
  const { activeOutputOrder, outputs } = calc;

  return (
    <div className="hidden print:block print:bg-white">
      <PrintCoverPage outputs={outputs} />
      {activeOutputOrder.map((key) => (
        <div
          key={key}
          className="break-after-page isolate relative flex min-h-[296mm] flex-col"
          style={PAGE_PADDING}
        >
          <div className="dfd-print-gradient dfd-print-bleed" aria-hidden="true" />
          <PrintPageHeader />
          <div className="flex-1">
            <PrintPanel outputKey={key} calc={calc} />
          </div>
          <PrintPageFooter />
        </div>
      ))}
      <div className="isolate relative flex min-h-[296mm] flex-col" style={PAGE_PADDING}>
        <div className="dfd-print-gradient dfd-print-bleed" aria-hidden="true" />
        <PrintPageHeader />
        <div className="flex-1">
          <ProcessStepsPanel />
        </div>
        <PrintPageFooter />
      </div>
    </div>
  );
}

function PrintPanel({ outputKey, calc }: { outputKey: OutputKey; calc: MieterstromCalculator }) {
  switch (outputKey) {
    case "angebot":
      return <AngebotPanel calc={calc} />;
    case "wirtschaft":
      return <WirtschaftPanel calc={calc} printMode />;
    case "flyer":
      return <FlyerPanel calc={calc} />;
  }
}
