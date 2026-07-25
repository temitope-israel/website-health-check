import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateReportPdf } from '@/lib/pdf';

const downloadSchema = z.object({
  url: z.string().url(),
  scores: z.object({
    performance: z.number().min(0).max(100),
    seo: z.number().min(0).max(100),
    accessibility: z.number().min(0).max(100),
    bestPractices: z.number().min(0).max(100),
  }),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = downloadSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const pdfBuffer = await generateReportPdf(result.data.url, result.data.scores);

return new NextResponse(new Uint8Array(pdfBuffer), {
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': 'attachment; filename="website-health-check-report.pdf"',
  },
});
}