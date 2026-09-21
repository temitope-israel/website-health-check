import { NextRequest, NextResponse } from 'next/server';
import { urlCheckSchema } from '@/lib/validation';
import { fetchPageSpeedReport, PageSpeedError } from '@/lib/pagespeed';
import { normalizeScores } from '@/lib/scoring';
import { auditRatelimit } from '@/lib/ratelimit';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = urlCheckSchema.safeParse(body);

    // Get IP address without using request.ip
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = realIp ?? forwardedFor?.split(',')[0].trim() ?? '127.0.0.1';

    // 1. Rate Limiting Check
    if (process.env.NODE_ENV === 'production') {
      try {
        const { success } = await auditRatelimit.limit(ip);
        if (!success) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again in a minute.' },
            { status: 429 }
          );
        }
      } catch (rateLimitErr) {
        console.error('Rate limiting check failed:', rateLimitErr);
        // Fallback: Continue execution if Upstash/Redis fails
      }
    }

    // 2. Schema Validation Check
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { url } = result.data;

    // 3. Fetch Audit & Save to Database
    const rawReport = await fetchPageSpeedReport(url);
    const scores = normalizeScores(rawReport);

    const lead = await prisma.lead.create({
      data: {
        url,
        performance: scores.performance,
        seo: scores.seo,
        accessibility: scores.accessibility,
        bestPractices: scores.bestPractices,
      },
    });

    return NextResponse.json({ url, scores, leadId: lead.id });

  } catch (err) {
    console.error('PageSpeed audit failed:', err);

    if (err instanceof PageSpeedError && err.reason === 'unreachable') {
      return NextResponse.json(
        {
          error:
            "We couldn't reach that URL. Please double-check it's correct, publicly accessible, and includes https://.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { error: 'We could not audit that URL right now. Please try again shortly.' },
      { status: 502 }
    );
  }
}