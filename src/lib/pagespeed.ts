const PAGESPEED_API_URL =
  'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

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

export async function fetchPageSpeedReport(
  targetUrl: string
): Promise<PageSpeedRawResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error('Missing PAGESPEED_API_KEY environment variable');
  }

  const params = new URLSearchParams({
    url: targetUrl,
    key: apiKey,
    strategy: 'mobile',
  });

  ['performance', 'seo', 'accessibility', 'best-practices'].forEach(
    (category) => {
      params.append('category', category);
    }
  );

  const response = await fetch(`${PAGESPEED_API_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `PageSpeed API request failed with status ${response.status}`
    );
  }

  return response.json();
}
