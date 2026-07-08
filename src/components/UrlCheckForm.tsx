'use client';

import { useState, FormEvent } from 'react';
import { urlCheckSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';

export function UrlCheckForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const result = urlCheckSchema.safeParse({ url });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setStatus('loading');

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Something went wrong');
      }

      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('idle');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
          className="flex-1 rounded-md border border-mist/20 bg-void px-4 py-3 font-mono text-sm text-paper placeholder:text-mist/50 focus:outline-none focus:ring-2 focus:ring-beacon"
          disabled={status === 'loading'}
        />
        <Button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Scanning…' : 'Run Free Diagnostic'}
        </Button>
      </div>

      {error && <p className="font-mono text-sm text-red-400">{error}</p>}
      {status === 'success' && (
        <p className="font-mono text-sm text-ok">
          Scan complete — results coming soon.
        </p>
      )}
    </form>
  );
}
