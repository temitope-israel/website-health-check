'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

interface PaginationProps {
  page: number;
  pageSize: number;
  totalCount: number;
}

export function Pagination({ page, pageSize, totalCount }: PaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  function updateParams(next: { page?: number; pageSize?: number }) {
    const query = new URLSearchParams(searchParams.toString());
    if (next.pageSize !== undefined) {
      query.set('pageSize', String(next.pageSize));
      query.set('page', '1');
    }
    if (next.page !== undefined) {
      query.set('page', String(next.page));
    }
    router.push(`${pathname}?${query.toString()}`);
  }

  return (
    <div className="mt-4 flex flex-col gap-3 font-mono text-xs text-mist sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <span>Show</span>
        <select
          value={pageSize}
          onChange={(e) => updateParams({ pageSize: Number(e.target.value) })}
          className="rounded border border-mist/20 bg-void px-2 py-1 text-paper"
        >
          {[10, 25, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>per page</span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => updateParams({ page: page - 1 })}
          disabled={page <= 1}
          className="disabled:opacity-30"
        >
          ← Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => updateParams({ page: page + 1 })}
          disabled={page >= totalPages}
          className="disabled:opacity-30"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
