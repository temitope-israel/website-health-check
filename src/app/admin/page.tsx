import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { SignOutButton } from '@/components/SignOutButton';
import { LeadsTable } from '@/components/admin/LeadsTable';
import { Pagination } from '@/components/admin/Pagination';

export default async function AdminDashboard({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = Number(params.pageSize) || 10;

  const session = await auth();

  const [leads, totalCount, allLeadsForAvg] = await Promise.all([
    prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.lead.count(),
    prisma.lead.findMany({
      select: {
        performance: true,
        seo: true,
        accessibility: true,
        bestPractices: true,
      },
    }),
  ]);

  const avgScore = allLeadsForAvg.length
    ? Math.round(
        allLeadsForAvg.reduce(
          (sum, l) =>
            sum +
            (l.performance + l.seo + l.accessibility + l.bestPractices) / 4,
          0
        ) / allLeadsForAvg.length
      )
    : 0;

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-beacon">
            Hotis Studio
          </p>
          <h1 className="mt-1 font-display text-3xl text-paper">Dashboard</h1>
          <p className="mt-1 font-mono text-sm text-mist">
            Signed in as {session?.user?.email}
          </p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-md border border-mist/10 bg-panel p-4">
          <p className="font-mono text-xs uppercase tracking-widest text-mist">
            Total Leads
          </p>
          <p className="mt-1 font-display text-2xl text-paper">{totalCount}</p>
        </div>
        <div className="rounded-md border border-mist/10 bg-panel p-4">
          <p className="font-mono text-xs uppercase tracking-widest text-mist">
            Avg Score
          </p>
          <p className="mt-1 font-display text-2xl text-beacon">{avgScore}</p>
        </div>
      </div>

      <div className="mt-8">
        <LeadsTable
          leads={leads}
          startIndex={(page - 1) * pageSize}
          totalCount={totalCount}
        />
        <Pagination page={page} pageSize={pageSize} totalCount={totalCount} />
      </div>
    </main>
  );
}
// import { auth } from '@/auth';
// import { prisma } from '@/lib/prisma';
// import { SignOutButton } from '@/components/SignOutButton';
// import * as Sentry from '@sentry/nextjs';

// export default async function AdminDashboard() {
//   const session = await auth();
//   if (session?.user?.email) {
//     Sentry.setUser({ email: session.user.email });
//   }
//   const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });

//   return (
//     <main className="mx-auto max-w-4xl px-6 py-16">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="font-display text-2xl text-paper">Captured Leads</h1>
//           <p className="mt-1 font-mono text-sm text-mist">
//             {leads.length} total — signed in as {session?.user?.email}
//           </p>
//         </div>
//         <SignOutButton />
//       </div>

//       <div className="mt-8 space-y-3">
//         {leads.map((lead) => (
//           <div
//             key={lead.id}
//             className="rounded-md border border-mist/10 bg-panel p-4 font-mono text-sm"
//           >
//             <div className="flex justify-between text-paper">
//               <span>{lead.email}</span>
//               <span className="text-mist">
//                 {lead.createdAt.toLocaleDateString()}
//               </span>
//             </div>
//             <p className="mt-1 text-mist">{lead.url}</p>
//             <p className="mt-2 text-xs text-mist">
//               Perf {lead.performance} · SEO {lead.seo} · A11y{' '}
//               {lead.accessibility} · BP {lead.bestPractices}
//             </p>
//           </div>
//         ))}
//       </div>
//     </main>
//   );
// }
