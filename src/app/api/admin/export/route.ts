import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Hotis Studio';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Leads');

  sheet.columns = [
    { header: '#', key: 'index', width: 6 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'URL', key: 'url', width: 35 },
    { header: 'Performance', key: 'performance', width: 13 },
    { header: 'SEO', key: 'seo', width: 10 },
    { header: 'Accessibility', key: 'accessibility', width: 14 },
    { header: 'Best Practices', key: 'bestPractices', width: 14 },
    { header: 'Date & Time', key: 'createdAt', width: 22 },
  ];

  sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0A0E14' },
  };

  leads.forEach((lead, i) => {
    sheet.addRow({
      index: i + 1,
      email: lead.email,
      url: lead.url,
      performance: lead.performance,
      seo: lead.seo,
      accessibility: lead.accessibility,
      bestPractices: lead.bestPractices,
      createdAt: new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(lead.createdAt),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(new Uint8Array(buffer as ArrayBuffer), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="hotis-studio-leads.xlsx"',
    },
  });
}