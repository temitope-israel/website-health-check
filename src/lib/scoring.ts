import { PageSpeedRawResult } from './pagespeed';

export type ScoreRating = 'good' | 'needs-improvement' | 'poor';

export interface AuditScores {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
}

export function getRating(score: number): ScoreRating {
  if (score >= 90) return 'good';
  if (score >= 50) return 'needs-improvement';
  return 'poor';
}

function toScore(raw: number | null | undefined): number {
  if (raw === null || raw === undefined) return 0;
  return Math.round(raw * 100);
}

export function normalizeScores(raw: PageSpeedRawResult): AuditScores {
  const categories = raw.lighthouseResult?.categories;

  return {
    performance: toScore(categories?.performance?.score),
    seo: toScore(categories?.seo?.score),
    accessibility: toScore(categories?.accessibility?.score),
    bestPractices: toScore(categories?.['best-practices']?.score),
  };
}
