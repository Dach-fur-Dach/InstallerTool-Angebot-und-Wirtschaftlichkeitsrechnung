"use client";

import { useState } from "react";
import type { MieterstromCalculator } from "@/hooks/useMieterstromCalculator";
import { OUTPUT_LABELS, type OutputKey } from "@/hooks/useMieterstromCalculator";
import { CheckIcon, ChevronIcon, DragHandleIcon } from "@/components/ui/Icons";
import { downloadPrintDocumentAsPdf, getPrintDocumentPdfBase64, buildPdfFilename } from "@/lib/generatePdf";

export function PdfEmailModal({ calc }: { calc: MieterstromCalculator }) {
  const { pdfEmailModalOpen, setPdfEmailModalOpen, installerEmail, setInstallerEmail, activeOutputOrder, reorderOutputs, moveOutput, form } =
    calc;
  const [sendCopyToInstaller, setSendCopyToInstaller] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [draggedKey, setDraggedKey] = useState<OutputKey | null>(null);
  const [dragOverKey, setDragOverKey] = useState<OutputKey | null>(null);

  if (!pdfEmailModalOpen) return null;

  const close = () => {
    setPdfEmailModalOpen(false);
    setStatus("idle");
    setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const filename = buildPdfFilename(form);

    try {
      const pdfBase64 = await getPrintDocumentPdfBase64();
      if (!pdfBase64) throw new Error("PDF konnte nicht erstellt werden.");

      const res = await fetch("/api/send-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfBase64,
          filename,
          installerEmail: sendCopyToInstaller ? installerEmail : undefined,
          sendCopyToInstaller,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "E-Mail-Versand fehlgeschlagen.");
      }

      setStatus("sent");
      await downloadPrintDocumentAsPdf(filename);
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Unbekannter Fehler.");
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
        {status === "sent" ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF2FF] text-[#3AA8DC]">
              <CheckIcon className="h-3.5 w-3.5" />
            </div>
            <h3 className="m-0 mb-1.5 text-base font-extrabold text-[#0A1628]">PDF wurde versendet</h3>
            <p className="m-0 text-[13px] text-[#5B6472]">
              {sendCopyToInstaller ? (
                <>
                  Eine Kopie wurde an <span className="font-semibold text-[#1B2A3A]">{installerEmail}</span> gesendet.
                </>
              ) : (
                "Eine Kopie wurde per E-Mail versendet."
              )}{" "}
              Der PDF-Download startet gleich.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3 className="m-0 mb-1.5 text-base font-extrabold text-[#0A1628]">PDF erstellen</h3>
            <p className="m-0 mb-4 text-[13px] text-[#5B6472]">
              Beim Download wird automatisch eine Kopie des PDFs per E-Mail versendet.
            </p>

            <label className="mb-4 flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={sendCopyToInstaller}
                onChange={(e) => setSendCopyToInstaller(e.target.checked)}
                className="mt-0.5 h-[17px] w-[17px] shrink-0 accent-[#3AA8DC]"
              />
              <span className="text-[13.5px] font-semibold text-[#0A1628]">
                Installateur soll ebenfalls eine Kopie per E-Mail erhalten
              </span>
            </label>

            {sendCopyToInstaller && (
              <input
                type="email"
                required
                autoFocus
                value={installerEmail}
                onChange={(e) => setInstallerEmail(e.target.value)}
                placeholder="installateur@beispiel.de"
                className="mb-5 w-full box-border rounded-lg border border-[#D0D5DD] px-[11px] py-[9px] text-[13.5px] text-[#0A1628]"
              />
            )}

            {status === "error" && (
              <p className="mb-4 text-[13px] font-semibold text-[#D92D20]">{errorMessage}</p>
            )}

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
                disabled={status === "sending"}
                className="flex-1 cursor-pointer rounded-[10px] border-none bg-[#3AA8DC] px-[22px] py-[11px] text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {status === "sending" ? "Wird gesendet…" : "PDF erstellen"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
