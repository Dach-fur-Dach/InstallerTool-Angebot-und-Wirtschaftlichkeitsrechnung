"use client";

import type { MieterstromCalculator, OutputKey } from "@/hooks/useMieterstromCalculator";
import { AngebotPanel } from "./AngebotPanel";
import { WirtschaftPanel } from "./WirtschaftPanel";
import { FlyerPanel } from "./FlyerPanel";

export function PrintDocument({ calc }: { calc: MieterstromCalculator }) {
  const { activeOutputOrder } = calc;

  return (
    <div className="hidden print:block print:bg-white">
      {activeOutputOrder.map((key) => (
        <div key={key} className="break-after-page">
          <PrintPanel outputKey={key} calc={calc} />
        </div>
      ))}
    </div>
  );
}

function PrintPanel({ outputKey, calc }: { outputKey: OutputKey; calc: MieterstromCalculator }) {
  switch (outputKey) {
    case "angebot":
      return <AngebotPanel calc={calc} />;
    case "wirtschaft":
      return <WirtschaftPanel calc={calc} />;
    case "flyer":
      return <FlyerPanel calc={calc} />;
  }
}
