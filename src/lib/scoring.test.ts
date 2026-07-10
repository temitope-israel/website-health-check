import { describe, it, expect } from 'vitest';
import { normalizeScores } from './scoring';
import { getRating } from './scoring';

describe('normalizeScores', () => {
  it('converts Lighthouse 0-1 scores into 0-100 scores', () => {
    const raw = {
      lighthouseResult: {
        categories: {
          performance: { score: 0.87 },
          seo: { score: 1 },
          accessibility: { score: 0.65 },
          'best-practices': { score: 0.92 },
        },
      },
    };

    expect(normalizeScores(raw)).toEqual({
      performance: 87,
      seo: 100,
      accessibility: 65,
      bestPractices: 92,
    });
  });

  it('defaults to 0 when a category is missing from the response', () => {
    const raw = { lighthouseResult: { categories: {} } };

    expect(normalizeScores(raw)).toEqual({
      performance: 0,
      seo: 0,
      accessibility: 0,
      bestPractices: 0,
    });
  });

  it('defaults to 0 when lighthouseResult is missing entirely', () => {
    expect(normalizeScores({})).toEqual({
      performance: 0,
      seo: 0,
      accessibility: 0,
      bestPractices: 0,
    });
  });
});

describe('getRating', () => {
  it('rates 90 and above as good', () => {
    expect(getRating(90)).toBe('good');
    expect(getRating(100)).toBe('good');
  });

  it('rates 50 to 89 as needs-improvement', () => {
    expect(getRating(89)).toBe('needs-improvement');
    expect(getRating(50)).toBe('needs-improvement');
  });

  it('rates below 50 as poor', () => {
    expect(getRating(49)).toBe('poor');
    expect(getRating(0)).toBe('poor');
  });
});
