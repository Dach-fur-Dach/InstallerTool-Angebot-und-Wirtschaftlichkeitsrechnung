import { NextResponse } from "next/server";
import { Resend } from "resend";

interface SendPdfBody {
  pdfBase64: string;
  filename: string;
  installerEmail?: string;
  sendCopyToInstaller: boolean;
}

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const copyEmail = process.env.PDF_COPY_EMAIL;

  if (!apiKey || !fromEmail || !copyEmail) {
    return NextResponse.json({ error: "E-Mail-Versand ist serverseitig nicht konfiguriert." }, { status: 500 });
  }

  const body = (await request.json()) as SendPdfBody;
  const { pdfBase64, filename, installerEmail, sendCopyToInstaller } = body;

  if (!pdfBase64 || !filename) {
    return NextResponse.json({ error: "PDF-Daten fehlen." }, { status: 400 });
  }

  const recipients = [copyEmail];
  if (sendCopyToInstaller) {
    if (!installerEmail) {
      return NextResponse.json({ error: "E-Mail-Adresse des Installateurs fehlt." }, { status: 400 });
    }
    recipients.push(installerEmail);
  }

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: fromEmail,
    to: recipients,
    subject: `Mieterstrom-Berechnung: ${filename}`,
    text: "Im Anhang finden Sie die aktuelle Mieterstrom-Berechnung als PDF.",
    attachments: [{ filename, content: pdfBase64 }],
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
