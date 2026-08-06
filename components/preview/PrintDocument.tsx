"use client";

import type { MieterstromCalculator, OutputKey } from "@/hooks/useMieterstromCalculator";
import { AngebotPanel } from "./AngebotPanel";
import { WirtschaftPanel } from "./WirtschaftPanel";
import { FlyerPanel } from "./FlyerPanel";
import { ProcessStepsPanel } from "./ProcessStepsPanel";
import { PrintPageHeader, PrintPageFooter } from "./PrintPageChrome";

const PAGE_PADDING = { padding: "14mm 12mm" };

export function PrintDocument({ calc }: { calc: MieterstromCalculator }) {
  const { activeOutputOrder } = calc;

  return (
    <div className="hidden print:block print:bg-white">
      {activeOutputOrder.map((key) => (
        <div key={key} className="break-after-page" style={PAGE_PADDING}>
          <PrintPageHeader />
          <PrintPanel outputKey={key} calc={calc} />
          <PrintPageFooter />
        </div>
      ))}
      <div style={PAGE_PADDING}>
        <PrintPageHeader />
        <ProcessStepsPanel />
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
