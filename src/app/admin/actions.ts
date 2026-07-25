'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
}

export async function deleteLead(id: number) {
  await requireAdmin();
  await prisma.lead.delete({ where: { id } });
  revalidatePath('/admin');
}

export async function deleteAllLeads() {
  await requireAdmin();
  await prisma.lead.deleteMany({});
  revalidatePath('/admin');
}