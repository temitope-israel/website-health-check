import { z } from 'zod';

export const urlCheckSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, 'Please enter a URL')
    .url('Please enter a valid URL (e.g. https://example.com)'),
});

export type UrlCheckInput = z.infer<typeof urlCheckSchema>;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Please enter your email to get your report')
  .email('Please enter a valid email address');

export const reportRequestSchema = z.object({
  leadId: z.number().int().positive(),
  email: emailSchema,
});

export type ReportRequestInput = z.infer<typeof reportRequestSchema>;