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
