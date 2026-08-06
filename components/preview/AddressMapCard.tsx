"use client";

import { useEffect, useState } from "react";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";

export function AddressMapCard({ calc }: { calc: MieterstromCalculator }) {
  const { form } = calc;
  const address = [form.objektStrasse, form.objektPlzStadt].filter(Boolean).join(", ");

  const [mapAddress, setMapAddress] = useState(address);

  useEffect(() => {
    const t = setTimeout(() => setMapAddress(address), 600);
    return () => clearTimeout(t);
  }, [address]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#E5EAF1] bg-[#FCFBF9] shadow-[0_1px_3px_rgba(16,24,40,0.06)]">
      <div className="px-7 pt-[18px] pb-3">
        <h3 className="m-0 text-base font-extrabold text-[#1B2A3A]">Objektstandort</h3>
      </div>

      {mapAddress ? (
        <iframe
          key={mapAddress}
          title="Objektstandort"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&t=k&output=embed`}
          className="w-full min-h-[220px] flex-1 border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="mx-7 mb-[18px] flex flex-1 items-center justify-center rounded-[10px] border border-dashed border-[#D0D5DD] bg-white/50 px-4 py-3.5 text-center text-[12.5px] font-medium text-[#667085]">
          Die Karte wird angezeigt, sobald eine Adresse eingegeben wurde.
        </div>
      )}
    </div>
  );
}
