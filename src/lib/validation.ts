import { z } from 'zod';

export const urlCheckSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Please enter a URL')
    .url('Please enter a valid URL (e.g. https://example.com)'),
});

export type UrlCheckInput = z.infer<typeof urlCheckSchema>;

export const reportRequestSchema = z.object({
  url: z.string().trim().url(),
  email: z.string().trim().email('Please enter a valid email address'),
  scores: z.object({
    performance: z.number().min(0).max(100),
    seo: z.number().min(0).max(100),
    accessibility: z.number().min(0).max(100),
    bestPractices: z.number().min(0).max(100),
  }),
});

export type ReportRequestInput = z.infer<typeof reportRequestSchema>;
