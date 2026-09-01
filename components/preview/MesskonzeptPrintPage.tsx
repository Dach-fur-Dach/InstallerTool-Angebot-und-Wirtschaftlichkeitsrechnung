"use client";

import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { MesskonzeptDiagram } from "@/components/form/MesskonzeptDiagram";

export function MesskonzeptPrintPage({ calc }: { calc: MieterstromCalculator }) {
  return (
    <div>
      <h2 className="m-0 mb-1 text-[28px] font-extrabold tracking-tight text-[#1B2A3A]">Messkonzept</h2>
      <p className="m-0 mb-5 text-[13px] text-[#5B6472]">Übersicht der Zähler- und Verteilungsstruktur der Anlage.</p>
      <MesskonzeptDiagram form={calc.form} />
    </div>
  );
}
