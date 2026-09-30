import { sendPdfEmail } from "@/lib/email";
import { MAX_EMAIL_PDF_BYTES } from "@/lib/generatePdf";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(body: Record<string, unknown>, status: number) {
  return Response.json(body, { status });
}

export async function POST(request: Request) {
  // Same-origin only: this endpoint sends mail, so don't let other sites drive it from a browser.
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.headers.get("host")) {
    return json({ error: "forbidden" }, 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "invalid_request" }, 400);
  }

  const email = String(form.get("email") ?? "").trim();
  const filename = String(form.get("filename") ?? "Mieterstrom.pdf").replace(/[\r\n"\\/]/g, "").slice(0, 200);
  const objekt = String(form.get("objekt") ?? "").replace(/[\r\n]/g, " ").slice(0, 200);
  const key = String(form.get("idempotencyKey") ?? "");
  const file = form.get("pdf");

  if (!EMAIL_RE.test(email) || email.length > 254 || !(file instanceof Blob) || !/^[\w-]{8,64}$/.test(key)) {
    return json({ error: "invalid_request" }, 400);
  }
  if (file.size > MAX_EMAIL_PDF_BYTES) return json({ error: "too_large" }, 413);

  const pdf = Buffer.from(await file.arrayBuffer());
  if (pdf.subarray(0, 5).toString("latin1") !== "%PDF-") return json({ error: "invalid_request" }, 400);

  const result = await sendPdfEmail({
    to: email,
    filename: filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`,
    pdf,
    objekt,
    idempotencyKey: `pdf-${key}`,
  });

  return result.ok ? json({ ok: true }, 200) : json({ error: "send_failed" }, 502);
}
