# Progress Log

## Day 1 — Wed, Jul 8, 2026

### Built

- Auth fundamentals mini-lesson (JWT vs sessions, OAuth authorization code flow, bcrypt) — no code, concepts only
- Initialized Next.js 15 (App Router) + TypeScript project via `create-next-app`
- Set up Tailwind CSS (scaffolded now, styling starts Day 2)
- Configured Prettier (`.prettierrc.json`, `.prettierignore`) alongside Next.js's default ESLint setup
- Set up Husky + lint-staged for pre-commit linting/formatting
- Created GitHub repo (public), pushed initial commit using Conventional Commits
- Added GitHub Actions CI workflow: lint + format check on every push/PR to `main`

### Decisions made

- Chose Neon over Supabase/Railway for the database: we don't need Supabase's bundled auth/storage since we're using Auth.js + Resend separately, and Neon's scale-to-zero + native Vercel integration fits a low-traffic side project better than Railway's always-on model
- Confirmed local Postgres won't work once deployed — Vercel runs serverless functions with no persistent process/disk, so the database must be hosted separately and reachable over the internet regardless of provider
- Developing against Neon from day one (not local Postgres) to avoid "works on my machine" drift before deployment

### Bugs hit & fixed (CI)

1. **`npm ci` failed — lockfile out of sync.** `package-lock.json` had `@types/node@20.19.43`, `package.json` wanted `^22.20.1`. Fixed with `npm install` locally to resync the lockfile, then committed it.
2. **Node 20 deprecation warning** on `actions/checkout@v4` / `actions/setup-node@v4` — informational only, not a failure; GitHub auto-falls-back to Node 24 runners for now. Noted for a future cleanup (bump to `@v5`).
3. **Prettier check failed** — 8 files (mostly `create-next-app` boilerplate) were never reformatted after we added `.prettierrc.json`. Fixed with `npm run format` + commit.

### What's next (Day 2)

- Page scaffolding, Tailwind design tokens, base layout, reusable UI primitives
- Static landing page shell (no logic yet)



## Day 2 — Thu, Jul 9, 2026

### Built
- Explored App Router file conventions (`layout.tsx`, `page.tsx`, `globals.css`) and Server Components
- Set up Tailwind v4 design tokens via `@theme` in `globals.css`
- Loaded custom fonts (Space Grotesk, Inter, IBM Plex Mono) via `next/font/google`
- Built reusable `Button` and `Card` components with TypeScript prop typing
- Built initial landing page shell using those primitives

### Decisions made
- First pass on the landing page (generic blue/white SaaS look) was rejected as too templated — redesigned around a "diagnostic/lighthouse" visual identity: dark control-room palette, warm amber "beacon" accent, functional green reserved for real score data later
- Adopted a 3-font system instead of one font doing every job: Space Grotesk (display/headlines), Inter (body), IBM Plex Mono (data/labels — reinforces the "instrument panel" feel)
- Added one deliberate signature animation (an amber "scanline" sweep across the input panel) rather than scattering motion throughout — kept restrained on purpose
- Respected `prefers-reduced-motion` on the scanline animation from the start, not as an afterthought

### Bugs hit & fixed
- Turbopack picked the wrong workspace root due to a stray `package-lock.json` at the Windows user-folder level. Removed the orphaned lockfile and explicitly pinned `turbopack.root` in `next.config.ts` so this can't recur.

### What's next (Day 3)
- Build the actual URL input form
- Zod schema for server-side validation
- First Next.js Route Handler (API endpoint)


## Day 3 — Fri, Jul 10, 2026

### Built
- `UrlCheckForm` Client Component — controlled input, client-side Zod validation, `fetch` POST to our own API
- Shared Zod schema (`src/lib/validation.ts`) used identically on both client and server — single source of truth for what a "valid URL" means
- First Route Handler: `src/app/api/audit/route.ts` (POST) — validates the request body server-side, currently returns a placeholder echo response
- Wired the form into the Day 2 landing page, replacing the static placeholder panel

### Concepts learned
- Client Components (`'use client'`) vs. Server Components — interactivity requires opting in, and only where actually needed
- Why client-side validation is a UX nicety, not a security boundary — the server-side check is the one that actually matters
- Zod: shared schemas, `safeParse`, `z.infer` for auto-generating TypeScript types from validation rules
- Route Handlers: filesystem-based API routes, HTTP method → exported function name convention (`POST`, `GET`, etc.)

### Bugs hit & fixed
- Form submission failed client-side ("something went wrong") despite the server logging a successful receipt — traced to a copy/paste error in `UrlCheckForm.tsx`, not a real logic bug. Confirmed using the browser's Network tab to compare what the client actually sent/received against the server logs.

## Day 4 — Sat, Jul 11, 2026

### Built
- Google PageSpeed Insights API integration (`src/lib/pagespeed.ts`) — real Lighthouse audits, not mocked
- Scoring/normalization logic (`src/lib/scoring.ts`) — converts Google's raw 0–1 category scores into clean 0–100 `AuditScores`
- Rating logic (`getRating`) using Lighthouse's official thresholds: 90+ Good, 50–89 Needs Improvement, <50 Poor
- `ScoreItem` component — displays each score with a color-coded plain-language rating, not just a bare number
- Loading UX: rotating status messages + elapsed-second counter while a scan is in progress (honest, not a fake progress bar)
- First Vitest unit tests — 8 test cases covering `normalizeScores` (including missing-data edge cases) and `getRating` (including exact boundary values)
- Added test run to CI (`npm run test` now required to pass, alongside lint/format)
- `.env.local` / `.env.example` pattern established for secrets (PageSpeed API key today; Resend, database URL, etc. will follow the same pattern)

### Decisions made
- Chose to unit-test the pure scoring/rating functions, not the PageSpeed network call itself — kept tests fast, deterministic, and free of API quota usage; real network behavior gets covered by Day 9's Playwright e2e test instead
- Used Lighthouse's own official score thresholds for ratings rather than inventing our own scale — keeps results recognizable/credible to anyone familiar with web performance tooling
- Rejected a fake percentage-based progress bar (PageSpeed's API gives no real incremental progress) in favor of honest elapsed-time + rotating status messages
- Noted a future idea (not in scope for the 10-day build): comparing a site's scores against the real population of sites we've scanned, once enough leads have accumulated

### Bugs hit & fixed
- Frontend never read the real API response on success — was still showing a hardcoded Day 3 placeholder message even though real scores were coming back correctly. Root cause: `res.json()` was only ever called in the error branch. Fixed by always parsing the response body and storing real data in state.

### What's next (Day 5)
- Framer Motion score-reveal animation (replacing today's plain score grid)
- Weekly review + build-in-public recap post

## Day 5 — Sun, Jul 12, 2026

### Built
- Installed Framer Motion
- `AnimatedNumber` component — count-up animation using `useMotionValue` + `useSpring`, driven via a ref rather than `setState` to avoid excessive re-renders on rapidly-changing values
- `ScoreReveal` + `ScoreRing` components — replaced the plain Day 4 score grid with animated SVG progress rings (stroke-dashoffset technique) that cascade in one after another using Framer Motion `variants` + `staggerChildren`
- Swapped `ScoreReveal` into `UrlCheckForm`, replacing the flat number grid from Day 4
- Kept `ScoreItem.tsx` in the codebase unused for now — likely reusable for a simpler list view in the Day 7 admin dashboard

### Concepts learned
- `motion` components, `initial`/`animate`, and named `variants` for declarative animation states
- `staggerChildren` for cascading/sequenced reveals without manually timing each element
- `useMotionValue` + `useSpring` for performant, physics-based animated values that bypass React's normal re-render cycle
- `useInView` to trigger an animation only once an element scrolls into view
- SVG progress-ring technique: `circumference`, `strokeDasharray`, `strokeDashoffset`

### Decisions made
- Skipped a separate formal "Week 1 recap" post — keeping to one focused post per build day instead, per founder preference
- Public post-day numbering stayed offset by one from real build-day numbering, following the Day 3+4 merge decision made earlier — `PROGRESS.md` continues tracking real build days regardless of the public post label

### Bugs hit & fixed
- CI lint failure: `react-hooks/set-state-in-effect` — the loading-state `useEffect` (built Day 4) was calling `setElapsedSeconds`/`setLoadingMessage` synchronously in the effect body instead of only inside later callbacks. Fixed by moving the reset calls into `handleSubmit` (the actual event handler triggering the loading state) and leaving the effect responsible only for setting up/cleaning up the interval subscriptions. Caught and resolved at the start of this session, before today's Framer Motion work began.

### What's next (Day 6)
- Resend email integration
- PDF report generation
- Email capture step in the UI

## Day 6 — Mon, Jul 13, 2026

### Built
- PDF report generation (`src/lib/pdf.tsx`) using @react-pdf/renderer — pure JS PDF drawing, no headless browser, Vercel-Hobby-tier friendly
- Resend integration (`src/lib/email.ts`) — transactional email with PDF attachment
- New Route Handler `/api/report` — validates email + scores, generates PDF, sends email
- Email capture step added to the form UI, appearing after a successful scan

### Decisions made
- Chose @react-pdf/renderer over Puppeteer for PDF generation — Puppeteer's headless-Chromium requirement doesn't fit reliably in Vercel's free serverless function limits; @react-pdf/renderer has zero browser dependency
- Currently sending from Resend's sandbox address (onboarding@resend.dev) to only my own verified email — real domain verification deferred to Day 10, right before public launch, since it's not needed for continued development
- Lead capture is still a console.log placeholder — real persistence lands Day 7 with Neon + Prisma

### What's next (Day 7)
- Set up Neon Postgres + Prisma
- Model User and Lead tables
- Auth.js Credentials provider for admin login (applying Day 1's JWT/bcrypt lesson)
- Replace today's console.log with a real database write