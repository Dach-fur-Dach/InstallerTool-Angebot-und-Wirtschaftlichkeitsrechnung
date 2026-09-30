import { Resend } from "resend";

const DEFAULT_FROM = "D4D Installer <installer@dachfuerdach.app>";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function buildPdfMail(objekt: string) {
  const subject = objekt ? `Ihr Mieterstrom-Angebot: ${objekt}` : "Ihr Mieterstrom-Angebot";
  const intro = objekt
    ? `anbei erhalten Sie das angeforderte PDF zum Objekt <strong>${escapeHtml(objekt)}</strong>.`
    : "anbei erhalten Sie das angeforderte PDF.";
  const introText = objekt
    ? `anbei erhalten Sie das angeforderte PDF zum Objekt ${objekt}.`
    : "anbei erhalten Sie das angeforderte PDF.";

  const html = `<!doctype html>
<html lang="de"><body style="margin:0;padding:0;background:#f4f6f9;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e5eaf1;font-family:Arial,Helvetica,sans-serif;color:#1b2a3a;">
<tr><td style="padding:28px 28px 8px;font-size:18px;font-weight:bold;color:#0a1628;">Ihr PDF vom Mieterstrom-Rechner</td></tr>
<tr><td style="padding:8px 28px;font-size:15px;line-height:1.55;">
<p style="margin:0 0 12px;">Guten Tag,</p>
<p style="margin:0 0 12px;">${intro}</p>
<p style="margin:0 0 12px;">Bei Fragen wenden Sie sich gerne an <a href="mailto:info@dachfuerdach.de" style="color:#1b6fa8;">info@dachfuerdach.de</a>.</p>
<p style="margin:0;">Freundliche Grüße<br>Ihr Team von Dach für Dach</p>
</td></tr>
<tr><td style="padding:20px 28px 24px;font-size:12px;line-height:1.5;color:#667085;border-top:1px solid #e5eaf1;">
Dach für Dach GmbH · Lohmühlenstraße 65 · 12435 Berlin · info@dachfuerdach.de<br>
Sie erhalten diese E-Mail, weil im Mieterstrom-Rechner der Versand eines PDFs an diese Adresse angefordert wurde.
</td></tr>
</table></td></tr></table></body></html>`;

  const text = `Guten Tag,

${introText}

Bei Fragen wenden Sie sich gerne an info@dachfuerdach.de.

Freundliche Grüße
Ihr Team von Dach für Dach

Dach für Dach GmbH · Lohmühlenstraße 65 · 12435 Berlin · info@dachfuerdach.de
Sie erhalten diese E-Mail, weil im Mieterstrom-Rechner der Versand eines PDFs an diese Adresse angefordert wurde.`;

  return { subject, html, text };
}

export type SendPdfArgs = {
  to: string;
  filename: string;
  pdf: Buffer;
  objekt: string;
  idempotencyKey: string;
};

// Single place for from/replyTo/copy/error handling. Never throws: returns ok=false on failure.
export async function sendPdfEmail(args: SendPdfArgs): Promise<{ ok: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[email] RESEND_API_KEY is not set");
    return { ok: false };
  }
  const copy = process.env.PDF_COPY_EMAIL?.trim();
  const { subject, html, text } = buildPdfMail(args.objekt);

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send(
      {
        from: process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_FROM,
        to: args.to,
        ...(copy ? { bcc: copy, replyTo: copy } : {}),
        subject,
        html,
        text,
        attachments: [{ filename: args.filename, content: args.pdf }],
      },
      { idempotencyKey: args.idempotencyKey },
    );
    if (error) {
      console.error("[email] Resend error", error.name, error.message);
      return { ok: false };
    }
    console.log("[email] sent", data?.id);
    return { ok: true, id: data?.id };
  } catch (err) {
    console.error("[email] send failed", err instanceof Error ? err.message : err);
    return { ok: false };
  }
}
