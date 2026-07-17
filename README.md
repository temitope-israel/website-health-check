# Website Health Check

A free, public website audit tool built by [Hotis Studio](#). Enter any URL, get an instant performance/SEO/accessibility/best-practices score with an animated breakdown, and receive a full PDF report by email. Built as a lead-generation tool and a public demonstration of full-stack engineering practice.

**Live:** https://webbsite-health-check.vercel.app/

## Features

- Real Lighthouse-style audits via Google PageSpeed Insights
- Animated, color-coded score reveal (Framer Motion)
- Branded PDF report generation and email delivery (Resend)
- Authenticated admin dashboard for captured leads (Auth.js, Credentials provider)
- Rate limiting, error tracking, and product analytics wired in from day one

## Tech Stack

Next.js (App Router) · TypeScript · Tailwind CSS · Framer Motion · Prisma · PostgreSQL (Neon) · Auth.js · Zod · Vitest · Playwright · Sentry · PostHog · Upstash Redis · Resend · Vercel

## Getting Started

```bash
npm install
cp .env.example .env
# fill in .env with your own keys — see below
npx prisma generate
npx prisma migrate dev
npx tsx prisma/seed.ts
npm run dev
```

## Environment Variables

See `.env.example` for the full list. You'll need free accounts with: Neon, Google Cloud (PageSpeed Insights API), Resend, Upstash, Sentry, and PostHog.

## Scripts

| Command                           | Purpose                                         |
| --------------------------------- | ----------------------------------------------- |
| `npm run dev`                     | Local development server                        |
| `npm run build`                   | Production build (runs `prisma generate` first) |
| `npm run lint` / `npm run format` | Code quality checks                             |
| `npm run test`                    | Vitest unit tests                               |
| `npm run test:e2e`                | Playwright end-to-end tests                     |

## Known Limitations

- **Resend is currently in sandbox mode** — reports can only be emailed to the account owner's address until a custom domain is verified. Planned once Hotis Studio's domain is registered.
- Playwright e2e tests are run locally/deliberately, not in CI, since they consume real third-party API quota per run.
