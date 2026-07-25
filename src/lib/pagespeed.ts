const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export interface PageSpeedRawResult {
  lighthouseResult?: {
    categories?: {
      performance?: { score: number | null };
      seo?: { score: number | null };
      accessibility?: { score: number | null };
      'best-practices'?: { score: number | null };
    };
  };
}

export class PageSpeedError extends Error {
  reason: 'unreachable' | 'unknown';
  constructor(message: string, reason: 'unreachable' | 'unknown' = 'unknown') {
    super(message);
    this.reason = reason;
  }
}

export async function fetchPageSpeedReport(targetUrl: string): Promise<PageSpeedRawResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error('Missing PAGESPEED_API_KEY environment variable');
  }

  const params = new URLSearchParams({
    url: targetUrl,
    key: apiKey,
    strategy: 'mobile',
  });

  ['performance', 'seo', 'accessibility', 'best-practices'].forEach((category) => {
    params.append('category', category);
  });

  const response = await fetch(`${PAGESPEED_API_URL}?${params.toString()}`);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message = errorBody?.error?.message ?? '';

    if (/ERRORED_DOCUMENT_REQUEST|DNS|NAME_NOT_RESOLVED|FAILED_DOCUMENT_REQUEST/i.test(message)) {
      throw new PageSpeedError('That site could not be reached.', 'unreachable');
    }

    throw new PageSpeedError(`PageSpeed API request failed with status ${response.status}`);
  }

  return response.json();
}