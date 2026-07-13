import { NextRequest, NextResponse } from 'next/server';
import { reportRequestSchema } from '@/lib/validation';
import { generateReportPdf } from '@/lib/pdf';
import { sendReporEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = reportRequestSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { url, email, scores } = result.data;

  try {
    const pdfBuffer = await generateReportPdf(url, scores);
    await sendReporEmail({ to: email, url, pdfBuffer });

    // Placeholder - Day 7 replaces this with a real database write.
    await prisma.lead.create({
      data: {
        email,
        url,
        performance: scores.performance,
        seo: scores.seo,
        accessibility: scores.accessibility,
        bestPractices: scores.bestPractices,
      },
    });

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('Failed to send report:', err);
    return NextResponse.json(
      {
        error:
          'We could not send your report right now. Please try again shortly.',
      },
      { status: 502 }
    );
  }
}
