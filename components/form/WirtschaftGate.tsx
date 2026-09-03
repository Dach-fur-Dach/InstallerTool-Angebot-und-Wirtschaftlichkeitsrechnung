"use client";

import { useEffect, useRef, useState } from "react";
import { Collapse } from "@/components/ui/Collapse";
import { InfoIcon } from "@/components/ui/Icons";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

// How long the "Werte sind editierbar" hint stays visible after clicking Ja
// before it fades back out on its own.
const HINT_DURATION_MS = 5000;

export function WirtschaftGate({ calc }: { calc: MieterstromCalculator }) {
  const { wirtschaftBenoetigt, setWirtschaftBenoetigt } = calc;
  const [hintVisible, setHintVisible] = useState(false);
  // Bumped on every "Ja" click and used as the highlight box's key, so remounting it
  // replays the dfd-hint-highlight flash even if the hint was already showing.
  const [pulseKey, setPulseKey] = useState(0);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const handleJa = () => {
    setWirtschaftBenoetigt("ja");
    setHintVisible(true);
    setPulseKey((k) => k + 1);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setHintVisible(false), HINT_DURATION_MS);
  };

  const handleNein = () => {
    setWirtschaftBenoetigt("nein");
    setHintVisible(false);
    if (hideTimer.current) clearTimeout(hideTimer.current);
  };

  const base = "cursor-pointer rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold";
  const active = "border border-[#3AA8DC] bg-[#3AA8DC] text-white font-bold";
  const inactive = "border border-[#D0D5DD] bg-white text-[#667085]";

  return (
    <div className="rounded-[14px] border border-[#E5EAF1] bg-[#FCFBF9] px-6 py-[18px] shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <span className="text-sm font-bold text-[#0A1628]">Wirtschaftlichkeitsrechnung benötigt?</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleNein}
            className={`${base} ${wirtschaftBenoetigt === "nein" ? active : inactive}`}
          >
            Nein
          </button>
          <button
            type="button"
            onClick={handleJa}
            className={`${base} ${wirtschaftBenoetigt === "ja" ? active : inactive}`}
          >
            Ja
          </button>
        </div>
      </div>
      <Collapse open={hintVisible} innerClassName="mt-4">
        <div
          key={pulseKey}
          className="dfd-hint-highlight flex items-start gap-2.5 rounded-[10px] border border-[#CFE3F0] bg-[#EAF6FC] px-3.5 py-3"
        >
          <InfoIcon className="mt-0.5 shrink-0 text-[#3AA8DC]" />
          <span className="text-[12.5px] font-semibold text-[#1B2A3A]">
            Alle Werte in der Wirtschaftlichkeitsrechnung sind editierbar — Sie können jeden berechneten Wert bei Bedarf manuell anpassen.
          </span>
        </div>
      </Collapse>
    </div>
  );
}
