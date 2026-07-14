import { NextRequest, NextResponse } from 'next/server';
import { reportRequestSchema } from '@/lib/validation';
import { generateReportPdf } from '@/lib/pdf';
import { sendReportEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { reportRatelimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  if (process.env.NODE_ENV === 'production') {
    const { success } = await reportRatelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }
  }

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
    await sendReportEmail({ to: email, url, pdfBuffer });

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
