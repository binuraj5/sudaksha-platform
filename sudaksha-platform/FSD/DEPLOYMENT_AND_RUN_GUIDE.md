# Assessment Engine – Deployment & Run Guide

**Reference:** `FSD/MASTER_ASSESSMENT_ENGINE_IMPLEMENTATION.md` Part 9

---

## Local development

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- PostgreSQL
- (Optional) Python 3.10+ for Voice/Video/Code backends

### 1. Install and DB

```bash
pnpm install
cp .env.example .env   # if present; set DATABASE_URL
pnpm prisma generate
pnpm prisma migrate dev
```

### 2. Run Next.js

```bash
pnpm dev
```

App: `http://localhost:3000`

### 3. (Optional) Python backend

For Voice (transcribe, TTS, evaluate), Video (analyze), or Code (execute):

- Run the Python service (see `python-backend/` or `python_service/` README).
- Set `PYTHON_API_URL` (or equivalent) in `.env` so Next.js can proxy to it.

---

## Environment variables

| Variable | Purpose |
|---------|--------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Auth signing (NextAuth) |
| `NEXTAUTH_URL` | App URL (e.g. `http://localhost:3000`) |
| `OPENAI_API_KEY` | Adaptive AI question generation, AI generate questions |
| `PYTHON_API_URL` | Base URL of Python backend (Voice/Video/Code) |

Optional for specific features:

- Voice: ElevenLabs or similar (if used by Python service)
- Code: Piston/emkc.org or HackerRank (if used)
- Email: SMTP or provider for invites/notifications

---

## Key URLs (assessment flows)

- **Admin – models:** `/assessments/admin/models`
- **Admin – build component:** `/assessments/admin/models/[modelId]/builder`
- **Candidate – take assessment:** Depends on invite/assignment (e.g. project or member assessment URL)
- **Runner:** Started from assessment start/component start (API + `AssessmentRunner`)

---

## E2E tests (Playwright)

```bash
pnpm install   # or: npm install
npx playwright install        # one-time: install Playwright browsers (Chromium, etc.)
pnpm test:e2e                  # or: npm run test:e2e – run all E2E tests (starts dev server if needed)
pnpm test:e2e:ui               # or: npm run test:e2e:ui – run with Playwright UI
```

- **Smoke tests** (no auth): login page loads; admin models and take page redirect to login when unauthenticated.
- **Authenticated tests** (optional): add `E2E_TEST_EMAIL` and `E2E_TEST_PASSWORD` to `.env`; Playwright loads `.env` via `dotenv/config`, so those four tests run automatically (login → admin models → builder → take invalid id → results). If unset, they are skipped.

Config: `playwright.config.ts`. Tests: `e2e/smoke.spec.ts`, `e2e/assessments.spec.ts`.

---

## Production checklist

1. **DB:** Run migrations; use a managed PostgreSQL or secure connection string.
2. **Auth:** Set `NEXTAUTH_SECRET` and `NEXTAUTH_URL` to production values.
3. **Secrets:** Store `OPENAI_API_KEY` and other keys in env/secrets manager; never commit.
4. **Python:** Deploy Python backend separately; set `PYTHON_API_URL` to its public/base URL.
5. **CORS / networking:** Ensure Next.js can call Python backend and any external APIs (Voice/Video/Code).
6. **Rate limits:** Consider rate limiting for runner and AI endpoints.

---

## Docker (from Master doc)

The Master doc Part 9 includes a sample `docker-compose.yml` for Next.js, FastAPI, and Postgres. Use or adapt it for your repo layout and env vars.
