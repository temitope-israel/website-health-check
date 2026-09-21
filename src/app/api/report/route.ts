import { NextRequest, NextResponse } from 'next/server';
import { reportRequestSchema } from '@/lib/validation';
import { generateReportPdf } from '@/lib/pdf';
import { sendReportEmail } from '@/lib/email';
import { prisma } from '@/lib/prisma';
import { reportRatelimit } from '@/lib/ratelimit';

const ALLOWED_EMAIL = process.env.SANDBOX_ALLOWED_EMAIL?.toLowerCase();

export async function POST(request: NextRequest) {
  try {
    // 1. Safe IP Extraction for Rate Limiting
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = realIp ?? forwardedFor?.split(',')[0].trim() ?? '127.0.0.1';

    if (process.env.NODE_ENV === 'production') {
      try {
        const { success } = await reportRatelimit.limit(ip);
        if (!success) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again in a minute.' },
            { status: 429 }
          );
        }
      } catch (rateLimitErr) {
        console.error('Rate limiting check failed:', rateLimitErr);
      }
    }

    // 2. Validate Request Body
    const body = await request.json();
    const result = reportRequestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { leadId, email } = result.data;

    // 3. Retrieve Lead Record
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) {
      return NextResponse.json(
        { error: 'We lost track of your scan. Please run it again.' },
        { status: 404 }
      );
    }

    const scores = {
      performance: lead.performance,
      seo: lead.seo,
      accessibility: lead.accessibility,
      bestPractices: lead.bestPractices,
    };

    // 4. Generate PDF Buffer
    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await generateReportPdf(lead.url, scores);
    } catch (err) {
      console.error('PDF generation failed:', err);
      return NextResponse.json(
        { error: 'We could not generate your report right now. Please try again shortly.' },
        { status: 502 }
      );
    }

    // 5. Send Email Notification
    const canDeliver = !ALLOWED_EMAIL || email.toLowerCase() === ALLOWED_EMAIL;
    let emailSent = false;

    if (canDeliver) {
      try {
        await sendReportEmail({ to: email, url: lead.url, pdfBuffer });
        emailSent = true;
      } catch (err) {
        console.error('Failed to send report email:', err);
        // Non-fatal — PDF download still proceeds below
      }
    }

    // 6. Update Database Record
    await prisma.lead.update({
      where: { id: leadId },
      data: {
        email,
        downloadedAt: new Date(),
        ...(emailSent ? { reportSentAt: new Date() } : {}),
      },
    });

    // 7. Return Binary PDF Response
    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="website-health-check-report.pdf"',
        'X-Email-Sent': emailSent ? 'true' : 'false',
      },
    });

  } catch (err) {
    console.error('Unhandled report generation error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while generating your report.' },
      { status: 500 }
    );
  }
}


// import { NextRequest, NextResponse } from 'next/server';
// import { reportRequestSchema } from '@/lib/validation';
// import { generateReportPdf } from '@/lib/pdf';
// import { sendReportEmail } from '@/lib/email';
// import { prisma } from '@/lib/prisma';
// import { reportRatelimit } from '@/lib/ratelimit';

// const ALLOWED_EMAIL = process.env.SANDBOX_ALLOWED_EMAIL?.toLowerCase();

// export async function POST(request: NextRequest) {
//   const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

//   if (process.env.NODE_ENV === 'production') {
//     const { success } = await reportRatelimit.limit(ip);
//     if (!success) {
//       return NextResponse.json(
//         { error: 'Too many requests. Please try again in a minute.' },
//         { status: 429 }
//       );
//     }
//   }

//   const body = await request.json();
//   const result = reportRequestSchema.safeParse(body);

//   if (!result.success) {
//     return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
//   }

//   const { leadId, email } = result.data;

//   const lead = await prisma.lead.findUnique({ where: { id: leadId } });
//   if (!lead) {
//     return NextResponse.json(
//       { error: 'We lost track of your scan. Please run it again.' },
//       { status: 404 }
//     );
//   }

//   const scores = {
//     performance: lead.performance,
//     seo: lead.seo,
//     accessibility: lead.accessibility,
//     bestPractices: lead.bestPractices,
//   };

//   let pdfBuffer: Buffer;
//   try {
//     pdfBuffer = await generateReportPdf(lead.url, scores);
//   } catch (err) {
//     console.error('PDF generation failed:', err);
//     return NextResponse.json(
//       { error: 'We could not generate your report right now. Please try again shortly.' },
//       { status: 502 }
//     );
//   }

//   const canDeliver = !ALLOWED_EMAIL || email.toLowerCase() === ALLOWED_EMAIL;
//   let emailSent = false;

//   if (canDeliver) {
//     try {
//       await sendReportEmail({ to: email, url: lead.url, pdfBuffer });
//       emailSent = true;
//     } catch (err) {
//       console.error('Failed to send report email:', err);
//       // Not fatal — the download still proceeds below.
//     }
//   }

//   await prisma.lead.update({
//     where: { id: leadId },
//     data: {
//       email,
//       downloadedAt: new Date(),
//       ...(emailSent ? { reportSentAt: new Date() } : {}),
//     },
//   });

//   return new NextResponse(new Uint8Array(pdfBuffer), {
//     headers: {
//       'Content-Type': 'application/pdf',
//       'Content-Disposition': 'attachment; filename="website-health-check-report.pdf"',
//       'X-Email-Sent': emailSent ? 'true' : 'false',
//     },
//   });
// }