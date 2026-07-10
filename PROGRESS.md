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

### What's next (Day 4)
- Integrate Google PageSpeed Insights API (or Lighthouse) to run a real audit
- Build scoring/normalization logic
- Vitest unit tests for that logic