# OwnPage

One repository for danielfreiremendes.com: the portfolio, the data warehouse (DWH), the AI chat and the university projects. Everything is served from one origin, so one login works for Chat and the DWH.

## Layout

```
frontend/              React + Vite app (one package, one multi-page build)
  index.html, src/     main site
  apa-quiz/            APA Mock Exam
  lisbon-house-prices/ Lisbon housing dashboard (Avalia)
  causality-survey/    conjoint survey
  feedback-pulse/      feedback dashboard
  public/              shared assets, sub-app assets under static/<app>/, _redirects
backend/               Cloudflare Worker "api-controller" (one router, one API)
  src/handlers/        chat, DWH and shared auth
  src/projects/        feedback-pulse, lisbon-house-prices, causality-survey
database/              all SQL and local Postgres
  postgres/            Flyway migrations for the local Node server
  sqlite/              D1 schemas and seeds for the Worker
data-pipelines/        Python scripts and raw data for the Lisbon dashboard
docs/                  reports and summaries per project
frontend-testing/      Cucumber UI tests (login and register)
```

## URLs and API

| URL | App | API |
|---|---|---|
| `/` | Home | none |
| `/chat` | AI chat (login required) | `/api/chat/*` |
| `/dwh` | Data warehouse (login required) | `/api/dwh/*` |
| `/login`, `/register` | Shared login | `/api/auth/*` |
| `/feedback-pulse` | Feedback Pulse | `/api/feedback-pulse/*` |
| `/apa-quiz` | APA Mock Exam | none (history in the browser) |
| `/lisbon-house-prices` | Lisbon House Prices (Avalia) | `/api/lisbon-house-prices/*` |
| `/causality-survey` | Causality survey | `POST /api/causality-survey/cbc` |

The sub-apps are separate pages in the same build. Links to them use a full page load, not the router.

## Local development

1. Postgres for chat and the DWH (optional if you use the full Worker below):
   ```bash
   cd database && docker compose up -d
   ```
2. API, either:
   - Node server with Postgres (chat and DWH only): `cd backend && npm run dev:local`. It reads the local secret from `backend/.dev.vars`, which is a placeholder for development only.
   - Full Worker with all routes on local D1: `cd backend && npx wrangler dev --port 8080`. Apply the schemas first, using the binding names from `wrangler.toml`, for example `npx wrangler d1 execute FEEDBACK_DB --local --file=../database/sqlite/feedback.sql`. The sqlite folder has `feedback.sql`, `causality_survey.sql`, `chat.sql` and the DWH migrations (`V0`–`V6`) for `DB`. Apply `lisbon_house_prices.sql` and `lisbon_house_prices_inserts.sql` to `AVALIA_DB`.
3. Frontend: `cd frontend && npm run dev`. `frontend/.env.development` points it at `http://localhost:8080`.
4. Tests: `cd frontend && npm test` runs the APA Mock Exam suite.

Feedback Pulse uses Workers AI, Vectorize and a Workflow, so those only work remotely: `npx wrangler dev --remote`.

## Deployment

- **Frontend:** Cloudflare Pages project `ownpage`, built from `frontend/` with `VITE_API_ENV=https://danielfreiremendes.com/api` and published from `frontend/dist`.
- **Backend:** Worker `api-controller` from `backend/`. Its `wrangler.toml` needs the real `database_id` for every D1 binding (`npx wrangler d1 list`). Wrangler does not fill these from environment variables, and any `wrangler d1` or `wrangler dev` command fails while they are empty. The `JWT_SECRET` comes from the GitHub secret of the same name.
- **Routing:** the Worker is mounted on `danielfreiremendes.com/api/*`.
- **CI:** `.github/workflows/release-pipeline.yml` deploys the Worker and the frontend on every push to `main`.

## Notes

- The DWH client and the Worker share one login cookie (`authToken`, path `/`). Chat keeps only a profile row per email in `CHAT_DB`.
- `database/info.md` covers the local Postgres. Earlier versions used hosted Postgres and Go APIs (Railway, Supabase, Neon, Render, Koyeb); their hosts, IDs and credentials are no longer in the repository.
