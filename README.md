# NebulaDW

NebulaDW is a modern Data Warehouse application. It runs in **two modes from one codebase**:

| | Production (cloud) | Local development |
|---|---|---|
| **API** | Cloudflare Worker (`controller/`) | Same Worker handlers, run under Node (`npm run dev:local`) |
| **Database** | Cloudflare D1 (serverless SQLite) | Postgres 15 in Docker, host port **5433** |
| **Frontend** | Cloudflare Pages | Vite dev server (`localhost:5173`) |
| **AI chat** | Cloudflare Workers AI | Not available locally (DWH features only) |

The Worker code is written in the D1/SQLite dialect. Locally, a thin adapter
(`controller/src/local/`) implements the D1 API over Postgres and translates the few
SQLite-specific constructs at runtime, so **the same handlers run unchanged against both
databases**. Production is never affected by the local tooling.

## Live Deployment
- **Production:** [danielfreiremendes.com](https://danielfreiremendes.com/)

---

## Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui
- **Backend:** Cloudflare Workers (TypeScript)
- **Database:** Cloudflare D1 (prod) / PostgreSQL (local)
- **AI Integration:** Cloudflare Workers AI
- **Testing:** Java + Maven (End-to-End Tests)

---

## Local development (Postgres)

The fast inner loop: a local Postgres, the API, and the frontend — all on your machine.
This is the supported local path on macOS, where `wrangler dev` (workerd) may not run.

**Prerequisites:** Docker, Node 18+ (Node 20+ recommended).

### 1. Start Postgres (port 5433)
Spins up Postgres and applies the migrations in `backend/init` via Flyway (schema, views,
seed data, generated orders):
```bash
cd backend
docker compose up -d
```
Connection: `postgresql://fahrrad_user:geheim@localhost:5433/fahrrad_db`

### 2. Start the API (port 8080)
```bash
cd controller
npm install
npm run dev:local
```
This runs `controller/src/local/server.ts` (the Worker handlers under Node) against Postgres.
JWT secret and other vars are read from `controller/.dev.vars`. Email verification is disabled
locally by default (`DISABLE_EMAILS=true`).

### 3. Start the frontend (port 5173)
```bash
cd frontend
npm install
npm run dev
```
`frontend/.env.development` points the app at `http://localhost:8080`.

Open http://localhost:5173 — dashboards and tables are served from the local Postgres.

---

## Production (Cloudflare)

### Cloudflare setup
Install Wrangler and authenticate:
```bash
npm install -g wrangler
wrangler login
```

### Databases (D1)
Create and seed the production database (SQLite migrations live in `backend/init_sqlite`):
```bash
npx wrangler d1 create db-prod
npx wrangler d1 execute db-prod --file=backend/drop_tables.sql --remote
npx wrangler d1 execute db-prod --file=backend/init_sqlite/V0__Create_Tables.sql --remote
npx wrangler d1 execute db-prod --file=backend/init_sqlite/V1__Create_Views.sql --remote
npx wrangler d1 execute db-prod --file=backend/init_sqlite/V2__Insert_Models.sql --remote
npx wrangler d1 execute db-prod --file=backend/init_sqlite/V3__Insert_Random_Test_Data.sql --remote
npx wrangler d1 execute db-prod --file=backend/init_sqlite/V4__Generate_Orders.sql --remote
```
Create the separate D1 database for the AI chat application:
```bash
npx wrangler d1 create chat-db
npx wrangler d1 execute chat-db --file=initial.sql --remote
```
Put the resulting `database_id` values into `controller/wrangler.toml` (the `DB` and `CHAT_DB`
bindings).

### Backend (Workers)
```bash
cd controller
npm install
npm run dev      # local D1 (SQLite) via wrangler, when supported
npm run deploy   # deploy to Cloudflare
```

### Frontend (Pages)
Deploy `frontend/` to Cloudflare Pages (Vite preset). Set the API URL in the host environment so
production builds target the Worker:
```env
VITE_API_ENV=your_cloudflare_worker_url
```

---

## Testing

End-to-End front-end tests use Java and Maven:
```bash
cd frontend-testing
mvn test
```

---

## Project Structure

```text
/
├── controller/           # Cloudflare Workers backend (TypeScript)
│   └── src/local/        # Node entrypoint + Postgres→D1 adapter (local dev only)
├── backend/
│   ├── docker-compose.yml  # local Postgres (port 5433) + Flyway
│   ├── init/               # Postgres migrations (local)
│   └── init_sqlite/        # D1/SQLite migrations (production)
├── frontend/             # Single Page Application (Vite + React)
└── frontend-testing/     # E2E Tests (Java + Maven)
```

---
Daniel Freire Mendes
