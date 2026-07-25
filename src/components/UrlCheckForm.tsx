'use client';

import { useState, useEffect, FormEvent } from 'react';
import { urlCheckSchema, emailSchema } from '@/lib/validation';
import { Button } from '@/components/ui/Button';
import { ScoreReveal } from './ui/ScoreReveal';
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
  const [leadId, setLeadId] = useState<number | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [email, setEmail] = useState('');
  const [reportStatus, setReportStatus] = useState<
    'idle' | 'loading' | 'success'
  >('idle');
  const [reportOutcome, setReportOutcome] = useState<
    'sent' | 'downloaded' | null
  >(null);
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
    setLeadId(null);
    setReportStatus('idle');
    setReportOutcome(null);
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
      setLeadId(data.leadId);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('idle');
    }
  }

  async function handleGetReport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setReportError(null);

    const emailCheck = emailSchema.safeParse(email);
    if (!emailCheck.success) {
      setReportError(emailCheck.error.issues[0].message);
      return;
    }

    if (!leadId) {
      setReportError('We lost track of your scan. Please run it again.');
      return;
    }

    setReportStatus('loading');

    try {
      const res = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, email: emailCheck.data }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Something went wrong');
      }

      const emailSent = res.headers.get('X-Email-Sent') === 'true';
      const blob = await res.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'website-health-check-report.pdf';
      link.click();
      URL.revokeObjectURL(downloadUrl);

      setReportOutcome(emailSent ? 'sent' : 'downloaded');
      setReportStatus('success');
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
          onChange={(e) => setUrl(e.target.value.toLowerCase())}
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
              onSubmit={handleGetReport}
              className="mt-6 flex flex-col gap-2 sm:flex-row"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-md border border-mist/20 bg-void px-4 py-3 font-mono text-sm text-paper placeholder:text-mist/50 focus:outline-none focus:ring-2 focus:ring-beacon"
                disabled={reportStatus === 'loading'}
              />
              <Button type="submit" disabled={reportStatus === 'loading'}>
                {reportStatus === 'loading'
                  ? 'Preparing…'
                  : 'Get My Full Report'}
              </Button>
            </form>
          ) : (
            <p className="mt-6 font-mono text-sm text-ok">
              {reportOutcome === 'sent'
                ? 'Sent to your inbox — and downloaded a copy for you too.'
                : "Downloaded! (Email delivery isn't available yet, but you're all set.)"}
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
