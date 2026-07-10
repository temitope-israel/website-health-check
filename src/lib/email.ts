import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendReportEmailParams {
  to: string;
  url: string;
  pdfBuffer: Buffer;
}

export async function sendReporEmail({
  to,
  url,
  pdfBuffer,
}: SendReportEmailParams) {
  return resend.emails.send({
    from: 'Hotis Studio <onboarding@resend.dev>',
    to,
    subject: `Your Website Health Check report for ${url}`,
    html: `
        <p>Hi,</p>
        <p>Your free website health check for <strong>${url}</strong> is attached as a PDF.
        <p>- Hotis Studio</p>`,
    attachments: [
      {
        filename: 'website-health-check-report.pdf',
        content: pdfBuffer,
      },
    ],
  });
}
