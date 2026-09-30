"use client";

import { useState } from "react";
import { track } from "@vercel/analytics";
import { trackEvent } from "@/lib/umami";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { OUTPUT_LABELS, type OutputKey } from "@/hooks/useMieterstromCalculator";
import { CheckIcon, ChevronIcon, DragHandleIcon } from "@/components/ui/Icons";
import { LogoUpload } from "@/components/ui/LogoUpload";
import {
  renderPrintDocumentPdf,
  downloadPdfBlob,
  buildPdfFilename,
  MAX_EMAIL_PDF_BYTES,
} from "@/lib/generatePdf";

type Status = "idle" | "working" | "sent" | "downloaded" | "too_large" | "failed";
type Delivery = "download" | "email";

export function PdfEmailModal({ calc }: { calc: MieterstromCalculator }) {
  const {
    pdfEmailModalOpen,
    setPdfEmailModalOpen,
    installerEmail,
    setInstallerEmail,
    activeOutputOrder,
    reorderOutputs,
    moveOutput,
    form,
  } = calc;
  const [status, setStatus] = useState<Status>("idle");
  const [delivery, setDelivery] = useState<Delivery>("download");
  const [draggedKey, setDraggedKey] = useState<OutputKey | null>(null);
  const [dragOverKey, setDragOverKey] = useState<OutputKey | null>(null);

  if (!pdfEmailModalOpen) return null;

  const close = () => {
    setPdfEmailModalOpen(false);
    setStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "working") return;
    setStatus("working");
    const filename = buildPdfFilename(form);
    track("pdf_downloaded");
    trackEvent("pdf_downloaded");

    const blob = await renderPrintDocumentPdf().catch(() => null);
    if (!blob) {
      setStatus("failed");
      return;
    }
    if (delivery === "download") {
      downloadPdfBlob(blob, filename);
      setStatus("downloaded");
      return;
    }

    // Email delivery. If the mail cannot be sent, fall back to a download so the PDF is never lost.
    if (blob.size > MAX_EMAIL_PDF_BYTES) {
      downloadPdfBlob(blob, filename);
      setStatus("too_large");
      return;
    }
    try {
      const body = new FormData();
      body.append("pdf", blob, filename);
      body.append("email", installerEmail.trim());
      body.append("filename", filename);
      body.append("objekt", [form.objektStrasse, form.objektPlzStadt].map((v) => v.trim()).filter(Boolean).join(", "));
      body.append("idempotencyKey", crypto.randomUUID());
      const res = await fetch("/api/send-pdf", { method: "POST", body });
      if (res.ok) {
        setStatus("sent");
        return;
      }
      downloadPdfBlob(blob, filename);
      setStatus(res.status === 413 ? "too_large" : "failed");
    } catch {
      downloadPdfBlob(blob, filename);
      setStatus("failed");
    }
  };

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,22,40,0.45)] px-4 print:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl border border-[#E5EAF1] bg-white p-7 shadow-[0_8px_30px_rgba(16,24,40,0.2)]"
      >
        {status === "working" ? (
          <div className="text-center">
            <h3 className="m-0 mb-1.5 text-base font-extrabold text-[#0A1628]">PDF wird erstellt</h3>
            <p className="m-0 text-[13px] text-[#5B6472]">Einen Moment bitte, das PDF wird erstellt und versendet.</p>
          </div>
        ) : status !== "idle" ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF2FF] text-[#3AA8DC]">
              <CheckIcon className="h-3.5 w-3.5" />
            </div>
            <h3 className="m-0 mb-1.5 text-base font-extrabold text-[#0A1628]">
              {status === "sent" ? "PDF versendet" : "PDF heruntergeladen"}
            </h3>
            <p className="m-0 mb-5 text-[13px] text-[#5B6472]">
              {status === "sent" && (
                <>
                  Das PDF wurde an <span className="font-semibold text-[#1B2A3A]">{installerEmail}</span> gesendet.
                </>
              )}
              {status === "downloaded" && "Das PDF wurde auf Ihr Gerät heruntergeladen."}
              {status === "too_large" && "PDF zu groß für den Versand per E-Mail. Es wurde stattdessen heruntergeladen."}
              {status === "failed" && "Der E-Mail-Versand hat nicht geklappt. Das PDF wurde stattdessen heruntergeladen."}
            </p>
            <button
              type="button"
              onClick={close}
              className="cursor-pointer rounded-[10px] border-none bg-[#3AA8DC] px-[22px] py-[11px] text-sm font-bold text-white"
            >
              Schließen
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="m-0 mb-3 text-base font-extrabold text-[#0A1628]">PDF erstellen</h3>
            <div className="mb-4 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Zustellung">
              {(
                [
                  ["download", "Herunterladen", "Direkt auf dieses Gerät"],
                  ["email", "Per E-Mail", "An eine Adresse senden"],
                ] as const
              ).map(([value, label, hint]) => (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={delivery === value}
                  onClick={() => setDelivery(value)}
                  className={`cursor-pointer rounded-lg border px-3 py-2.5 text-left ${
                    delivery === value ? "border-[#3AA8DC] bg-[#EAF6FC]" : "border-[#E5EAF1] bg-white"
                  }`}
                >
                  <div className="text-[13px] font-semibold text-[#0A1628]">{label}</div>
                  <div className="text-[11.5px] text-[#5B6472]">{hint}</div>
                </button>
              ))}
            </div>
            {delivery === "email" && (
              <input
                type="email"
                required
                autoFocus
                value={installerEmail}
                onChange={(e) => setInstallerEmail(e.target.value)}
                placeholder="installateur@beispiel.de"
                aria-label="E-Mail-Adresse"
                className="mb-5 w-full box-border rounded-lg border border-[#D0D5DD] px-[11px] py-[9px] text-[13.5px] text-[#0A1628]"
              />
            )}

            <div className="mb-5">
              <div className="mb-2 text-[13px] font-semibold text-[#0A1628]">Installateur-Logo</div>
              <LogoUpload calc={calc} />
            </div>

            {activeOutputOrder.length > 1 && (
              <div className="mb-5">
                <div className="mb-2 text-[13px] font-semibold text-[#0A1628]">Reihenfolge im PDF</div>
                <ul className="flex flex-col gap-1.5">
                  {activeOutputOrder.map((key, i) => (
                    <li
                      key={key}
                      draggable
                      onDragStart={() => setDraggedKey(key)}
                      onDragEnd={() => {
                        setDraggedKey(null);
                        setDragOverKey(null);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (draggedKey && draggedKey !== key) setDragOverKey(key);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedKey) reorderOutputs(draggedKey, key);
                        setDraggedKey(null);
                        setDragOverKey(null);
                      }}
                      className={`flex cursor-grab items-center gap-2.5 rounded-lg border px-3 py-2 text-[13px] font-medium text-[#1B2A3A] transition-colors active:cursor-grabbing ${
                        dragOverKey === key
                          ? "border-[#3AA8DC] bg-[#EAF6FC]"
                          : "border-[#E5EAF1] bg-[#FCFBF9]"
                      } ${draggedKey === key ? "opacity-40" : "opacity-100"}`}
                    >
                      <span className="text-[#C2C9D3]">
                        <DragHandleIcon />
                      </span>
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E5EAF1] text-[11px] font-bold text-[#5B6472]">
                        {i + 1}
                      </span>
                      <span className="flex-1">{OUTPUT_LABELS[key]}</span>
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={i === 0}
                          onClick={() => moveOutput(key, -1)}
                          title="Nach oben verschieben"
                          className="flex h-4 w-4 items-center justify-center text-[#98A2B3] disabled:opacity-30"
                        >
                          <ChevronIcon className="rotate-180" />
                        </button>
                        <button
                          type="button"
                          disabled={i === activeOutputOrder.length - 1}
                          onClick={() => moveOutput(key, 1)}
                          title="Nach unten verschieben"
                          className="flex h-4 w-4 items-center justify-center text-[#98A2B3] disabled:opacity-30"
                        >
                          <ChevronIcon />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

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
                {delivery === "email" ? "PDF senden" : "PDF herunterladen"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
