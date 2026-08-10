const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;

function sanitizeFilenamePart(s: string): string {
  return s.replace(/[\\/:*?"<>|]/g, "").trim();
}

// Referenznummer aus aktuellem Datum + Uhrzeit (YYMMDD-HHmm), damit mehrere PDFs
// für dasselbe Objekt eindeutig benennbar bleiben, ohne den Dateinamen aufzublähen.
function buildReferenceNumber(now: Date = new Date()): string {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const min = String(now.getMinutes()).padStart(2, "0");
  return `MS-${yy}${mm}${dd}-${hh}${min}`;
}

// Dateiname nach dem Muster "Kunde- Straße Nr., PLZ Stadt - Installer - Referenznummer.pdf",
// analog zur bisherigen Benennung im Referenz-Kalkulator (Google Sheet).
export function buildPdfFilename(form: {
  kunde: string;
  objektStrasse: string;
  objektPlzStadt: string;
  installer: string;
}): string {
  const kunde = form.kunde.trim() || "Mieterstrom";
  const adresse = [form.objektStrasse.trim(), form.objektPlzStadt.trim()].filter(Boolean).join(", ");
  const parts = [`${kunde}-`, adresse, form.installer.trim() && `- ${form.installer.trim()}`]
    .filter(Boolean)
    .join(" ")
    .trim();
  return `${sanitizeFilenamePart(`${parts} - ${buildReferenceNumber()}`)}.pdf`;
}

// Renders the hidden print document (id="print-document") into a jsPDF instance.
// Shared by the direct-download and email-sending flows so both produce identical output.
async function renderPrintDocumentToPdf() {
  const container = document.getElementById("print-document");
  if (!container) return null;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas-pro"), import("jspdf")]);

  const prevStyle = {
    display: container.style.display,
    position: container.style.position,
    left: container.style.left,
    top: container.style.top,
    width: container.style.width,
    background: container.style.background,
  };

  container.style.display = "block";
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  container.style.width = `${A4_WIDTH_MM}mm`;
  container.style.background = "#ffffff";

  try {
    const pages = Array.from(container.children) as HTMLElement[];
    const pdf = new jsPDF({ unit: "mm", format: "a4" });

    for (let i = 0; i < pages.length; i++) {
      const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
    }

    return pdf;
  } finally {
    container.style.display = prevStyle.display;
    container.style.position = prevStyle.position;
    container.style.left = prevStyle.left;
    container.style.top = prevStyle.top;
    container.style.width = prevStyle.width;
    container.style.background = prevStyle.background;
  }
}

// Renders the hidden print document (id="print-document") to a real PDF and
// triggers a direct file download. Replaces window.print(): that route opens
// the browser's print dialog, which requires the user to manually choose
// "Save as PDF" rather than downloading a file outright.
export async function downloadPrintDocumentAsPdf(filename: string) {
  const pdf = await renderPrintDocumentToPdf();
  if (!pdf) return;
  pdf.save(filename);
}

// Renders the print document and returns it as a base64 string (no data: URI
// prefix) so it can be sent as an email attachment via the send-pdf API route.
export async function getPrintDocumentPdfBase64(): Promise<string | null> {
  const pdf = await renderPrintDocumentToPdf();
  if (!pdf) return null;
  return pdf.output("datauristring").split(",")[1];
}
