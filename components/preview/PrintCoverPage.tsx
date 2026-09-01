"use client";

import Image from "next/image";
import type { MieterstromCalculator, OutputsState } from "@/hooks/useMieterstromCalculator";

const COVER_SUBTITLE_LABELS: { key: keyof OutputsState; label: string }[] = [
  { key: "angebot", label: "Angebot" },
  { key: "wirtschaft", label: "Wirtschaftlichkeitsrechnung" },
  { key: "flyer", label: "Mieter-Flyer" },
];

function buildSubtitle(outputs: OutputsState) {
  const active = COVER_SUBTITLE_LABELS.filter((o) => outputs[o.key]).map((o) => o.label);
  if (active.length === 0) return "";
  if (active.length === 1) return active[0];
  return `${active.slice(0, -1).join(", ")} & ${active[active.length - 1]}`;
}

export function PrintCoverPage({ outputs, installerLogo }: { outputs: OutputsState; installerLogo?: string | null }) {
  const subtitle = buildSubtitle(outputs);

  return (
    <div className="break-after-page isolate relative flex h-[296mm] flex-col p-[14mm_12mm]">
      <div className="dfd-print-gradient dfd-print-bleed" aria-hidden="true" />
      <div className="flex items-center justify-end gap-3">
        {installerLogo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={installerLogo} alt="Installateur-Logo" className="h-9 w-auto max-w-[130px] object-contain" />
        )}
        <Image src="/logo.png" alt="Dach für Dach" height={44} width={184} className="h-11 w-auto" />
      </div>
      <div className="mt-10">
        <h1 className="m-0 text-[52px] leading-[1.05] font-extrabold tracking-tight text-[#1B2A3A]">Mieterstrom</h1>
        {subtitle && <p className="mt-3 text-[22px] leading-snug font-medium text-[#1B2A3A]">{subtitle}</p>}
      </div>
    </div>
  );
}
