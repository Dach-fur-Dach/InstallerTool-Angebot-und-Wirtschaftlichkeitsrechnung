"use client";

import Image from "next/image";
import { CustomerBuildingBox } from "@/components/form/CustomerBuildingBox";
import { MieterstromModelBox } from "@/components/form/MieterstromModelBox";
import { WirtschaftGate } from "@/components/form/WirtschaftGate";
import { EnergySystemBox } from "@/components/form/EnergySystemBox";
import { ConsumptionBox } from "@/components/form/ConsumptionBox";
import { PricingBox } from "@/components/form/PricingBox";
import { OutputControls } from "@/components/preview/OutputControls";
import { AngebotPanel } from "@/components/preview/AngebotPanel";
import { WirtschaftPanel } from "@/components/preview/WirtschaftPanel";
import { useMieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export default function Home() {
  const calc = useMieterstromCalculator();

  return (
    <div className="min-h-screen px-6 pt-7 pb-20 box-border">
      <div className="mx-auto max-w-[1560px]">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <Image src="/logo.png" alt="Dach für Dach" height={34} width={140} className="h-[34px] w-auto" priority />
            <div className="h-[26px] w-px bg-[rgba(10,22,40,0.12)]" />
            <div className="text-[12.5px] font-semibold text-[#5B6472]">Mieterstrom-Feasibility-Rechner</div>
          </div>
          <div className="text-[13px] font-medium text-[#5B6472]">Für den Einsatz beim Kundentermin</div>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <div className="flex min-w-[400px] flex-1 basis-[460px] flex-col gap-4">
            <CustomerBuildingBox calc={calc} />
            <MieterstromModelBox calc={calc} />
            <WirtschaftGate calc={calc} />
            <EnergySystemBox calc={calc} />
            <ConsumptionBox calc={calc} />
            <PricingBox calc={calc} />
          </div>

          <div className="flex min-w-[400px] flex-1 basis-[460px] flex-col gap-4">
            <OutputControls calc={calc} />
            <AngebotPanel calc={calc} />
            <WirtschaftPanel calc={calc} />
          </div>
        </div>
      </div>
    </div>
  );
}
