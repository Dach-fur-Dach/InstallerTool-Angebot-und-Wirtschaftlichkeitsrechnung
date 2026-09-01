"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import type { MieterstromCalculator, OutputKey } from "@/hooks/useMieterstromCalculator";
import { AngebotPanel } from "./AngebotPanel";
import { FlyerPanel } from "./FlyerPanel";
import { PrintPageHeader, PrintPageFooter } from "./PrintPageChrome";
import { PrintCoverPage } from "./PrintCoverPage";
import { ProcessStepsPanel } from "./ProcessStepsPanel";
import { wirtschaftPrintPages } from "./WirtschaftPrintPages";
import { MesskonzeptPrintPage } from "./MesskonzeptPrintPage";

const PAGE_PADDING = { padding: "14mm 12mm" };

export function PrintDocument({ calc }: { calc: MieterstromCalculator }) {
  const { activeOutputOrder, outputs, installerLogo } = calc;

  const pages = activeOutputOrder.flatMap((key) =>
    getPrintPages(key, calc).map((content, i) => ({ pageKey: `${key}-${i}`, content }))
  );

  return (
    <div id="print-document" className="hidden print:block print:bg-white">
      <PrintCoverPage outputs={outputs} installerLogo={installerLogo} />
      {pages.map(({ pageKey, content }) => (
        <div
          key={pageKey}
          className="break-after-page isolate relative flex h-[296mm] flex-col"
          style={PAGE_PADDING}
        >
          <div className="dfd-print-gradient dfd-print-bleed" aria-hidden="true" />
          <PrintPageHeader installerLogo={installerLogo} />
          <div className="flex flex-1 flex-col">{content}</div>
          <PrintPageFooter />
        </div>
      ))}
      <div className="isolate relative flex h-[296mm] flex-col" style={PAGE_PADDING}>
        <div className="dfd-print-gradient dfd-print-bleed" aria-hidden="true" />
        <PrintPageHeader installerLogo={installerLogo} />
        <div className="flex-1">
          <ProcessStepsPanel />
          <Image
            src="/contact-band.png"
            alt="Wir sind für Sie jederzeit verfügbar"
            width={1414}
            height={260}
            className="mt-6 h-auto w-full rounded-2xl"
          />
        </div>
        <PrintPageFooter />
      </div>
    </div>
  );
}

function getPrintPages(outputKey: OutputKey, calc: MieterstromCalculator): ReactNode[] {
  switch (outputKey) {
    case "angebot":
      return [<AngebotPanel key="angebot" calc={calc} />];
    case "wirtschaft":
      return wirtschaftPrintPages(calc);
    case "flyer":
      return [<FlyerPanel key="flyer" calc={calc} />];
    case "messkonzept":
      return [<MesskonzeptPrintPage key="messkonzept" calc={calc} />];
  }
}
