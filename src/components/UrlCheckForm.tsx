'use client';

import { useState, useEffect, FormEvent } from 'react';
import { urlCheckSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { ScoreItem } from '@/components/ui/ScoreItem';
import type { AuditScores } from '@/lib/scoring';

const LOADING_MESSAGES = [
  'Fetching your site…',
  'Measuring performance…',
  'Checking SEO signals…',
  'Testing accessibility…',
  'Reviewing best practices…',
  'Almost done…',
];

export function UrlCheckForm() {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [scores, setScores] = useState<AuditScores | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (status !== 'loading') return;

    setElapsedSeconds(0);
    setLoadingMessage(LOADING_MESSAGES[0]);

    let messageIndex = 0;
    const messageInterval = setInterval(() => {
      messageIndex = Math.min(messageIndex + 1, LOADING_MESSAGES.length - 1);
      setLoadingMessage(LOADING_MESSAGES[messageIndex]);
    }, 2500);

    const secondsInterval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(secondsInterval);
    };
  }, [status]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setScores(null);

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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong');
      }

      setScores(data.scores);
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

      {status === 'loading' && (
        <div className="mt-4 font-mono text-sm text-mist">
          <p>{loadingMessage}</p>
          <p className="mt-1 text-xs text-mist/60">
            {elapsedSeconds}s elapsed — larger, heavier sites take longer to
            scan
          </p>
        </div>
      )}

      {status === 'success' && scores && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <ScoreItem label="Performance" score={scores.performance} />
          <ScoreItem label="SEO" score={scores.seo} />
          <ScoreItem label="Accessibility" score={scores.accessibility} />
          <ScoreItem label="Best Practices" score={scores.bestPractices} />
        </div>
      )}
    </form>
  );
}
