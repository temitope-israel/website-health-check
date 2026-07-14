import { NextRequest, NextResponse } from 'next/server';
import { urlCheckSchema } from '@/lib/validation';
import { fetchPageSpeedReport } from '@/lib/pagespeed';
import { normalizeScores } from '@/lib/scoring';
import { auditRatelimit } from '@/lib/ratelimit';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = urlCheckSchema.safeParse(body);
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  if (process.env.NODE_ENV === 'production') {
    const { success } = await auditRatelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again in a minute.' },
        { status: 429 }
      );
    }
  }

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { url } = result.data;

  try {
    const rawReport = await fetchPageSpeedReport(url);
    const scores = normalizeScores(rawReport);
    return NextResponse.json({ url, scores });
  } catch (err) {
    console.error('PageSpeed audit failed:', err);
    return NextResponse.json(
      {
        error:
          'We could not audit that URL right now. Please try again shortly.',
      },
      { status: 502 }
    );
  }
}
