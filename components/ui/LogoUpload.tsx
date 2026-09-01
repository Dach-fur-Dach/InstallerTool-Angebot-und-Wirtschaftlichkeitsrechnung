"use client";

import { useRef, useState } from "react";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { PlusIcon } from "@/components/ui/Icons";

const MAX_LOGO_BYTES = 1.5 * 1024 * 1024;

export function LogoUpload({ calc }: { calc: MieterstromCalculator }) {
  const { installerLogo, setInstallerLogo } = calc;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Bitte eine Bilddatei auswählen.");
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      setError("Datei zu groß (max. 1,5 MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setInstallerLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex items-center gap-2">
      {installerLogo ? (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={installerLogo}
            alt="Installateur-Logo"
            className="h-10 w-auto max-w-[140px] object-contain"
          />
          <button
            type="button"
            onClick={() => setInstallerLogo(null)}
            title="Logo entfernen"
            className="cursor-pointer text-[11px] font-semibold text-[#98A2B3] hover:text-[#3AA8DC]"
          >
            Entfernen
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title="Eigenes Installateur-Logo hochladen"
          className="flex cursor-pointer items-center gap-1.5 rounded-[8px] border border-dashed border-[#D0D5DD] px-2.5 py-1.5 text-[11.5px] font-semibold text-[#5B6472] hover:border-[#3AA8DC] hover:text-[#3AA8DC]"
        >
          <PlusIcon className="h-3 w-3" />
          Logo hochladen
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <span className="text-[11px] font-medium text-[#D64545]">{error}</span>}
    </div>
  );
}
