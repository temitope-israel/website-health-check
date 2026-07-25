'use client';

import { useTransition } from 'react';
import { deleteLead, deleteAllLeads } from '@/app/admin/actions';

interface Lead {
  id: number;
  email: string | null;
  url: string;
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  downloadedAt: Date | null;
  reportSentAt: Date | null;
  createdAt: Date;
}

export function LeadsTable({
  leads,
  startIndex,
  totalCount,
}: {
  leads: Lead[];
  startIndex: number;
  totalCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: number) {
    if (!window.confirm('Delete this lead?')) return;
    startTransition(async () => {
      await deleteLead(id);
    });
  }

  function handleDeleteAll() {
    if (
      !window.confirm(`Delete all ${totalCount} leads? This cannot be undone.`)
    )
      return;
    startTransition(async () => {
      await deleteAllLeads();
    });
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <a
          href="/api/admin/export"
          className="font-mono text-xs text-mist underline hover:text-paper"
        >
          Export Excel
        </a>
        {leads.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={isPending}
            className="font-mono text-xs text-red-400 hover:text-red-300"
          >
            Delete All
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-md border border-mist/10">
        <table className="w-full font-mono text-sm">
          <thead>
            <tr className="border-b border-mist/10 text-left text-xs uppercase tracking-widest text-mist">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">URL</th>
              <th className="px-4 py-3">Scores</th>
              <th className="px-4 py-3">Date &amp; Time</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr
                key={lead.id}
                className="border-b border-mist/5 last:border-0"
              >
                <td className="px-4 py-3 text-mist">{startIndex + index + 1}</td>
                <td className="px-4 py-3 text-paper">{lead.email}</td>
                <td className="max-w-[180px] truncate px-4 py-3 text-mist">
                  {lead.url}
                </td>
                <td className="px-4 py-3 text-xs text-mist">
                  P{lead.performance} · S{lead.seo} · A{lead.accessibility} · B
                  {lead.bestPractices}
                </td>
                <td className="px-4 py-3 text-mist">
                  {new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(lead.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(lead.id)}
                    disabled={isPending}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-mist">
                  No leads captured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}