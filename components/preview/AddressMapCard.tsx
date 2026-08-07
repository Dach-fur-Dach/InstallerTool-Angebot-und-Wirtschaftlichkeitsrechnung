"use client";

import { useEffect, useState } from "react";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { ExternalLinkIcon, MinusIcon, PlusIcon } from "@/components/ui/Icons";

const MIN_ZOOM = 3;
const MAX_ZOOM = 21;
const DEFAULT_ZOOM = 19;

export function AddressMapCard({ calc }: { calc: MieterstromCalculator }) {
  const { form } = calc;
  const address = [form.objektStrasse, form.objektPlzStadt].filter(Boolean).join(", ");

  const [mapAddress, setMapAddress] = useState(address);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [zoomedFor, setZoomedFor] = useState(mapAddress);

  useEffect(() => {
    const t = setTimeout(() => setMapAddress(address), 600);
    return () => clearTimeout(t);
  }, [address]);

  // Reset zoom whenever the address changes so a new lookup always starts fully zoomed in on
  // the building (adjusting state during render, per React's guidance for this exact case).
  if (mapAddress !== zoomedFor) {
    setZoomedFor(mapAddress);
    setZoom(DEFAULT_ZOOM);
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5EAF1] bg-[#FCFBF9] shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      {mapAddress ? (
        <>
          <iframe
            key={`${mapAddress}-${zoom}`}
            title="Objektstandort"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&t=k&z=${zoom}&output=embed`}
            className="min-h-[260px] w-full flex-1 border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <div className="absolute right-3 bottom-3 flex flex-col overflow-hidden rounded-lg border border-[#E5EAF1] bg-white shadow-[0_2px_8px_rgba(16,24,40,0.16)]">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + 1))}
              disabled={zoom >= MAX_ZOOM}
              title="Vergrößern"
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-[#344054] hover:bg-[#F7FAFC] disabled:cursor-not-allowed disabled:text-[#C2C9D3]"
            >
              <PlusIcon />
            </button>
            <div className="h-px bg-[#E5EAF1]" />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - 1))}
              disabled={zoom <= MIN_ZOOM}
              title="Verkleinern"
              className="flex h-8 w-8 cursor-pointer items-center justify-center text-[#344054] hover:bg-[#F7FAFC] disabled:cursor-not-allowed disabled:text-[#C2C9D3]"
            >
              <MinusIcon />
            </button>
          </div>

          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md bg-white/85 px-2 py-1 text-[10.5px] font-semibold text-[#5B6472] backdrop-blur-sm hover:text-[#3AA8DC]"
          >
            In Google Maps öffnen <ExternalLinkIcon />
          </a>
        </>
      ) : (
        <div className="m-4 flex flex-1 items-center justify-center rounded-[10px] border border-dashed border-[#D0D5DD] bg-white/50 px-4 py-3.5 text-center text-[12.5px] font-medium text-[#667085]">
          Die Karte wird angezeigt, sobald eine Adresse eingegeben wurde.
        </div>
      )}
    </div>
  );
}
