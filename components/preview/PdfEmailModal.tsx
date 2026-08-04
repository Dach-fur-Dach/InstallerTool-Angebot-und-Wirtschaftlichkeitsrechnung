"use client";

import { useState } from "react";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { CheckIcon } from "@/components/ui/Icons";

export function PdfEmailModal({ calc }: { calc: MieterstromCalculator }) {
  const { pdfEmailModalOpen, setPdfEmailModalOpen, installerEmail, setInstallerEmail } = calc;
  const [sent, setSent] = useState(false);

  if (!pdfEmailModalOpen) return null;

  const close = () => {
    setPdfEmailModalOpen(false);
    setSent(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,22,40,0.45)] px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl border border-[#E5EAF1] bg-white p-7 shadow-[0_8px_30px_rgba(16,24,40,0.2)]"
      >
        {sent ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF2FF] text-[#3AA8DC]">
              <CheckIcon className="h-3.5 w-3.5" />
            </div>
            <h3 className="m-0 mb-1.5 text-base font-extrabold text-[#0A1628]">PDF wird erstellt</h3>
            <p className="m-0 mb-6 text-[13px] text-[#5B6472]">
              Der Versand an <span className="font-semibold text-[#1B2A3A]">{installerEmail}</span> ist eine
              Demo-Funktion und erfolgt hier nicht wirklich.
            </p>
            <button
              type="button"
              onClick={close}
              className="w-full cursor-pointer rounded-[10px] border-none bg-[#3AA8DC] px-[22px] py-[11px] text-sm font-bold text-white"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="m-0 mb-1.5 text-base font-extrabold text-[#0A1628]">E-Mail des Installateurs</h3>
            <p className="m-0 mb-4 text-[13px] text-[#5B6472]">
              Bitte E-Mail-Adresse angeben, an die das PDF gesendet werden soll.
            </p>
            <input
              type="email"
              required
              autoFocus
              value={installerEmail}
              onChange={(e) => setInstallerEmail(e.target.value)}
              placeholder="installateur@beispiel.de"
              className="mb-5 w-full box-border rounded-lg border border-[#D0D5DD] px-[11px] py-[9px] text-[13.5px] text-[#0A1628]"
            />
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={close}
                className="flex-1 cursor-pointer rounded-[10px] border border-[#D0D5DD] bg-white px-[22px] py-[11px] text-sm font-semibold text-[#667085]"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 cursor-pointer rounded-[10px] border-none bg-[#3AA8DC] px-[22px] py-[11px] text-sm font-bold text-white"
              >
                PDF erstellen
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
