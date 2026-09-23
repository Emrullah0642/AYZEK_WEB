# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

AYZEK Platform — the website for the AYZEK tech community (Selçuk University). Monorepo with a Next.js frontend and a FastAPI backend, deployed together via Docker Compose behind nginx.

- `FRONTEND/` — Next.js 14 (App Router) + TypeScript + Tailwind CSS 4 site (public pages + an `/admin` content-management panel)
- `BACKEND/` — FastAPI + SQLAlchemy + PostgreSQL REST API
- `nginx/default.conf` — reverse proxy config used in production
- `docker-compose.yml` — production stack (db + backend + frontend + nginx)
- `docker-compose.local.yml` — local dev stack (exposes ports 5432/8000/3000 directly, no nginx)
- `.github/workflows/deploy.yml` — on push to `main`, SSHes into the server, `git reset --hard origin/main`, then `docker compose up -d --build`

## Commands

### Frontend (`FRONTEND/`)
```bash
npm install       # or: pnpm install
npm run dev        # dev server (hot reload)
npm run build       # production build
npm run start       # run production build
npm run lint         # ESLint / Next lint
npx tsc --noEmit      # type-check only
```
No test runner is configured for the frontend.

### Backend (`BACKEND/`)
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload          # dev server (run from BACKEND/)
alembic revision --autogenerate -m "msg"  # create a migration (run from BACKEND/)
alembic upgrade head                    # apply migrations
```
No test suite exists in `BACKEND/` yet.

### Full stack via Docker
```bash
docker compose -f docker-compose.local.yml up --build   # local: db:5432, backend:8000, frontend:3000
docker compose up -d --build                             # production stack (used by CI/CD)
```

### Env files
- `.env.example` at repo root → copy to `.env` (used by docker-compose: `POSTGRES_PASSWORD`, `JWT_SECRET_KEY`, `JWT_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, Cloudflare R2 credentials).
- `BACKEND/.env` needs `DATABASE_URL` (e.g. `postgresql+psycopg2://postgres:PASSWORD@127.0.0.1:5432/ayzek_db`) when running the backend outside Docker.
- `FRONTEND/.env.local` needs `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_API_BASE` (backend base URL) and `NEXT_PUBLIC_ADMIN_PASSWORD`.

## Architecture

### Backend structure
Each domain (teams, events, blog, crew, journey, timeline, gallery_events, event_suggestions, community, poster, admin_auth) follows the same three-file pattern:
- `app/routers/<domain>.py` — FastAPI `APIRouter`, defines public GET routes and admin-only mutating routes
- `app/crud/<domain>.py` — DB query functions used by the router
- `app/schemas/<domain>.py` — Pydantic request/response models

`app/models.py` holds all SQLAlchemy ORM models (single file, `Base` from `app/database.py`). `app/main.py` wires every router into the `FastAPI()` app, sets up CORS (`ALLOWED_ORIGINS` env var, comma-separated), gzip, a proxy-scheme-fix middleware, a global exception handler, and mounts `public/` as static files for uploads.

**Router prefixes** (mounted in `app/main.py`, all under the backend root, no global `/api` prefix except one outlier):
| Prefix | Router file | Notes |
|---|---|---|
| `/admin` | `admin_auth.py` | login, `/me`, logout, 2FA setup/enable/disable |
| `/teams` | `teams.py` | + `/teams/featured` |
| `/timeline` | `timeline.py` | |
| `/journey` | `journey.py` | |
| `/crew` | `crew.py` | |
| `/blogs` | `blog.py` | |
| `/posters` | `poster.py` | |
| `/events` | `events.py` | |
| `/event-suggestions` | `event_suggestions.py` | user-submitted event ideas → reviewed by admin |
| `/community` | `community.py` | "join the community" applications |
| `/api/gallery-events` | `gallery_events.py` | **inconsistent** — only router with an `/api` prefix; frontend calls must match this exactly (`/api/gallery-events`, not `/gallery-events`) |

**Auth**: JWT stored in an **HttpOnly cookie** (`admin_token`, `samesite=lax`), set by `POST /admin/login` in `admin_auth.py`. `app/security.py`'s `require_admin`/`get_current_admin` dependency reads the token from that cookie first, falling back to an `Authorization: Bearer` header (useful for Swagger/Postman testing), decodes it, and loads the `Admin` row by the `sub` (email) claim. Routers that mutate data take `current_admin = Depends(get_current_admin)`. Login is rate-limited to `5/minute` via `app/limiter.py` (slowapi, keyed by remote IP) — reuse `limiter` + `@limiter.limit(...)` for any other endpoint that needs throttling.
- **2FA**: TOTP-based (`pyotp` + `qrcode`), optional per admin (`Admin.totp_secret`). `POST /admin/2fa/setup` returns a base64 QR code + secret; `POST /admin/2fa/enable` verifies a code and persists the secret; login requires `credentials.totp_code` once a secret is set (`admin_login` schema), returning `401 "2FA_REQUIRED"` if omitted.
- `security=False` on the login cookie (`app/routers/admin_auth.py`) is intentional for local HTTP dev — **must be `True` in production over HTTPS**; check this isn't silently reverted when touching that file.
- A separate `app/middleware.py::JWTMiddleware` (header-only bearer check on `/admin` paths) exists but is **not registered** in `app/main.py` — the actual enforcement is the `require_admin` per-route dependency, not that middleware. Don't assume it's active.

**Image uploads**: multipart (`UploadFile`) endpoints (teams, journey, crew, blog, poster, gallery-events, events) call `utils/r2_service.py::upload_file_to_r2`, which downsizes/re-encodes images to JPEG (max 1920px, quality 85, via Pillow) before pushing to Cloudflare R2 over the S3-compatible API (`boto3`), returning `R2_PUBLIC_DOMAIN/filename`. Older/legacy files may still sit under `public/uploads` (served by the `/public` static mount in `main.py`) — new uploads should go through R2, not local disk.

**Migrations**: Alembic is configured (`BACKEND/alembic/`, `alembic.ini`) but only has a couple of revisions — schema changes should go through `alembic revision --autogenerate` against `app/models.py`, not manual SQL.

### Frontend structure
Next.js App Router under `FRONTEND/app/`: route folders are `about`, `admin`, `blog`, `events`, `join`, `teams`, plus `page.tsx` (home), `layout.tsx`, `sitemap.ts`, `robots.ts`.

- `lib/api.ts` — single Axios instance (`api`), `baseURL` from `NEXT_PUBLIC_API_BASE`/`NEXT_PUBLIC_API_URL`, **`withCredentials: true`** (required so the `admin_token` cookie is sent cross-origin to `api.ayzek.tr`). **Actual convention**: almost every component calls `api.get/post/put/delete("/endpoint", ...)` directly inline with the raw backend path (see `components/admin/*.tsx`, `app/events/page.tsx`, `app/admin/page.tsx`) — comments like `// api.get (Cookie otomatik gider)` mark this pattern throughout. Only the Journey domain has typed wrapper functions (`getJourney`/`createJourney`/`deleteJourney`) in `lib/api.ts` itself; that's the exception, not the dominant style — match the surrounding file rather than assuming wrappers exist elsewhere. Remember the `/api` prefix quirk for gallery-events (`/api/gallery-events`) when writing new calls for that domain.
- Admin CRUD components (`team-management.tsx`, `blog-management.tsx`, `journey-management.tsx`, `crew-management.tsx`, `gallery-management.tsx`, `poster-management.tsx`, `timeline-management.tsx`, `admin-etkinlikler.tsx`) all follow the same shape: fetch list on mount, build a `FormData` for create/update (since the backend endpoints take `Form(...)`/`File(...)`, not JSON bodies), and call `api.post`/`api.put` with `Content-Type: multipart/form-data`.
- `contexts/admin-context.tsx` — `AdminProvider`/`useAdmin()`: client-side edit-mode UI state (`isAdminLoggedIn`, `isEditMode`) plus an in-memory `notifications` list seeded with hardcoded mock entries — **not** fetched from the backend; don't treat it as a real data source. Actual admin session state/auth is separately checked via `GET /admin/me` (e.g. in `app/admin/page.tsx`, `admin-dashboard.tsx`).
- `components/admin/` — admin panel UI (content editing for blog, events, teams, gallery, timeline, posters, crew, journey, 2FA setup in `admin-dashboard.tsx`); `components/ui/` — shadcn/ui (Radix-based) primitives per `components.json`.
- Login flow (`app/admin/page.tsx`): `POST /admin/login` with `{email, password, totp_code?}`; a `401` with detail `"2FA_REQUIRED"` means the UI should prompt for a TOTP code and resubmit.

### Cross-cutting notes
- CORS/origins, DB connection, and JWT secrets are all environment-driven — production values are injected via `docker-compose.yml` + the root `.env`, not committed.
- The production frontend/backend communicate over `https://api.ayzek.tr`; locally they talk over `http://localhost:8000`. Keep `ALLOWED_ORIGINS` (backend) and `NEXT_PUBLIC_API_BASE`/`NEXT_PUBLIC_API_URL` (frontend) in sync when adding new origins.
- Because auth is an HttpOnly cross-site cookie, both sides must agree: backend cookie needs `samesite=lax`/`secure=True` in prod and CORS `allow_credentials=True` with an explicit origin (not `*`); frontend needs `withCredentials: true` on every request that touches `/admin/*` or other protected routes.
- Mutating endpoints across almost every domain accept `multipart/form-data` (`Form`/`File`), not JSON — keep new admin endpoints consistent with this so the existing `FormData`-based admin components keep working.
- The repo contains a stray `__MACOSX/` directory (leftover from a zip extraction) — not part of the app, safe to ignore.
