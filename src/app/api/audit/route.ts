import { NextRequest, NextResponse } from 'next/server';
import { urlCheckSchema } from '@/lib/validation';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = urlCheckSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const { url } = result.data;

  // Placeholder for now — Day 4 replaces this with a real audit.
  console.log('Received valid URL to audit:', url);

  return NextResponse.json({ received: url });
}
