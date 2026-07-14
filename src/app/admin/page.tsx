import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SignOutButton } from '@/components/SignOutButton';
import * as Sentry from '@sentry/nextjs';

export default async function AdminDashboard() {
  const session = await auth();
  if (session?.user?.email) {
    Sentry.setUser({ email: session.user.email });
  }
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-paper">Captured Leads</h1>
          <p className="mt-1 font-mono text-sm text-mist">
            {leads.length} total — signed in as {session?.user?.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-8 space-y-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="rounded-md border border-mist/10 bg-panel p-4 font-mono text-sm"
          >
            <div className="flex justify-between text-paper">
              <span>{lead.email}</span>
              <span className="text-mist">
                {lead.createdAt.toLocaleDateString()}
              </span>
            </div>
            <p className="mt-1 text-mist">{lead.url}</p>
            <p className="mt-2 text-xs text-mist">
              Perf {lead.performance} · SEO {lead.seo} · A11y{' '}
              {lead.accessibility} · BP {lead.bestPractices}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
