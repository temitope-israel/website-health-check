# Case Study: Website Health Check

## The Problem

Hotis Studio needed a way to generate warm freelance/full-time leads while publicly demonstrating full-stack capability — not just a portfolio piece sitting static, but something live, useful, and shareable.

## The Approach

A free, public audit tool: visitors get real value (an honest, Lighthouse-backed diagnosis of their site) in exchange for an email — a lead-generation mechanic that only works if the tool itself is genuinely good, not gated or gimmicky.

Built in 10 days, ~20+ hours/week, using a stack chosen for consistency across three portfolio projects: Next.js, TypeScript, Prisma, Auth.js, and a fully free-tier-compatible set of infrastructure (Neon, Resend, Upstash, Sentry, PostHog, Vercel).

## Key Decisions

- **Redesigned the landing page mid-build** after the first pass felt generic — rebuilt around a "diagnostic scan" visual identity (dark palette, an amber "beacon" accent, monospace data treatment) tied directly to what the product actually does.
- **Chose @react-pdf/renderer over Puppeteer** for PDF generation, since headless-Chromium doesn't fit reliably in Vercel's free serverless limits.
- **Tested pure logic with Vitest, full user flows with Playwright** — deliberately different tools for deliberately different jobs, rather than one test suite doing everything.
- **Instrumented from day one, not as an afterthought** — rate limiting, error tracking, and analytics were built in before launch, not bolted on after a problem appeared.

## Real Problems Solved

- A Prisma major-version upgrade (v7) removed its built-in query engine mid-build, requiring an explicit driver-adapter migration.
- A genuine Vercel + Prisma 7 build failure (generated client not reliably present at build time), fixed with an explicit build-step and output-path configuration rather than relying on inferred defaults.
- Several real integration bugs (a nested-`<form>` hydration error, a frontend never reading a real API response) caught specifically because of deliberate end-to-end testing, not just manual clicking.

## Outcome

A live, fully functional lead-generation tool, deployed and observable, built transparently in public across 10 days — [see the full day-by-day build log](./PROGRESS.md).

## Known Next Step

Resend domain verification, to move past sandbox-mode email restrictions — deferred deliberately rather than compromising the project's free-tier constraint on the final day.
