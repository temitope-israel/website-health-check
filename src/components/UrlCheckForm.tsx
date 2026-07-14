'use client';

import { useState, useEffect, FormEvent } from 'react';
import { urlCheckSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
// import { ScoreItem } from '@/components/ui/ScoreItem';
import type { AuditScores } from '@/lib/scoring';
import { ScoreReveal } from './ui/ScoreReveal';
import posthog from 'posthog-js';

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
  const [email, setEmail] = useState('');
  const [reportStatus, setReportStatus] = useState<
    'idle' | 'loading' | 'success'
  >('idle');
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'loading') return;

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
    setReportError(null);

    const result = urlCheckSchema.safeParse({ url });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setStatus('loading');

    setElapsedSeconds(0);
    setLoadingMessage(LOADING_MESSAGES[0]);

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
      posthog.capture('audit_run', { url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('idle');
    }
  }

  async function handleSendReport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReportError(null);

    if (!scores) return;

    setReportStatus('loading');

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email, scores }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? 'Something went wrong');
      }

      setReportStatus('success');
      posthog.capture('report_requested', { url });
    } catch (err) {
      setReportError(
        err instanceof Error ? err.message : 'Something went wrong'
      );
      setReportStatus('idle');
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
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
      </form>

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
        <>
          <ScoreReveal scores={scores} />

          {reportStatus !== 'success' ? (
            <form
              onSubmit={handleSendReport}
              className="mt-6 flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="flex-1 rounded-md border border-mist/20 bg-void px-4 py-3 font-mono text-sm text-paper placeholder:text-mist/50 focus:outline-none focus:ring-2 focus:ring-beacon"
                disabled={reportStatus === 'loading'}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={reportStatus === 'loading'}
              >
                {reportStatus === 'loading'
                  ? 'Sending…'
                  : 'Email Me the Report'}
              </Button>
            </form>
          ) : (
            <p className="mt-6 font-mono text-sm text-ok">
              Report sent — check your inbox.
            </p>
          )}

          {reportError && (
            <p className="mt-2 font-mono text-sm text-red-400">{reportError}</p>
          )}
        </>
      )}
    </div>
  );
}
