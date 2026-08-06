"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { CustomerBuildingBox } from "@/components/form/CustomerBuildingBox";
import { MieterstromModelBox } from "@/components/form/MieterstromModelBox";
import { WirtschaftGate } from "@/components/form/WirtschaftGate";
import { EnergySystemBox } from "@/components/form/EnergySystemBox";
import { ConsumptionBox } from "@/components/form/ConsumptionBox";
import { PricingBox } from "@/components/form/PricingBox";
import { OutputControls } from "@/components/preview/OutputControls";
import { AddressMapCard } from "@/components/preview/AddressMapCard";
import { AngebotPanel } from "@/components/preview/AngebotPanel";
import { WirtschaftPanel } from "@/components/preview/WirtschaftPanel";
import { FlyerPanel } from "@/components/preview/FlyerPanel";
import { PdfEmailModal } from "@/components/preview/PdfEmailModal";
import { PrintDocument } from "@/components/preview/PrintDocument";
import { useMieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export default function Home() {
  const calc = useMieterstromCalculator();
  const flyerRef = useRef<HTMLDivElement>(null);
  const anyOutput = calc.outputs.wirtschaft || calc.outputs.angebot || calc.outputs.flyer;

  useEffect(() => {
    if (calc.outputs.flyer) {
      const t = setTimeout(() => {
        flyerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 350);
      return () => clearTimeout(t);
    }
  }, [calc.outputs.flyer]);

  return (
    <div className="min-h-screen box-border px-6 pt-7 pb-20">
      <div className="mx-auto max-w-[1560px] print:hidden">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Image src="/logo.png" alt="Dach für Dach" height={64} width={264} className="h-16 w-auto" priority />
            <div className="h-[26px] w-px bg-[rgba(10,22,40,0.12)]" />
            <div className="text-[12.5px] font-semibold text-[#5B6472]">Mieterstrom-Rechner</div>
          </div>
          <div className="flex items-center gap-5">
            <OutputControls calc={calc} />
            <button
              type="button"
              disabled={!anyOutput}
              onClick={() => calc.setPdfEmailModalOpen(true)}
              title={anyOutput ? "PDF mit den ausgewählten Inhalten erstellen" : "Bitte mindestens einen Inhalt auswählen"}
              className={
                anyOutput
                  ? "whitespace-nowrap rounded-[10px] border-none bg-[#3AA8DC] px-[22px] py-[11px] text-sm font-bold text-white shadow-[0_2px_6px_rgba(46,155,214,0.3)] cursor-pointer"
                  : "whitespace-nowrap rounded-[10px] border-none bg-[#E5EAF1] px-[22px] py-[11px] text-sm font-bold text-[#98A2B3] cursor-not-allowed"
              }
            >
              PDF erstellen
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <div className="min-w-[400px]">
            <CustomerBuildingBox calc={calc} />
          </div>
          <div className="min-w-[400px]">
            <AddressMapCard calc={calc} />
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-[400px] flex-1 basis-[460px] flex-col gap-4">
            <MieterstromModelBox calc={calc} />
            <WirtschaftGate calc={calc} />
            <EnergySystemBox calc={calc} />
            <ConsumptionBox calc={calc} />
            <PricingBox calc={calc} />
          </div>

          <div className="flex min-w-[400px] flex-1 basis-[460px] flex-col gap-4">
            <AngebotPanel calc={calc} />
            <WirtschaftPanel calc={calc} />
            {calc.outputs.flyer && <FlyerPanel ref={flyerRef} calc={calc} />}
          </div>
        </div>
      </div>

      <PdfEmailModal calc={calc} />
      <PrintDocument calc={calc} />
    </div>
  );
}
