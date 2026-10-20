# Local database

Postgres for `npm run dev:local` in `backend/` (chat and DWH only).

```bash
cd database
docker compose up -d
```

Flyway applies the migrations in `database/postgres/` on startup. To stop and wipe the volume:

```bash
docker compose down -v
```

## Demo account and demo data

- Demo login: `testuser@example.com` / `test` (used by the "demo" button on the DWH login page).
- Roles from V3: `testuser` is `user` on project 1 and `admin` on project 2. `testcreator` and `testadmin` share both projects.
- V4 seeds 120 orders. V5 replaces the orders of projects 1 and 2 with about 2 years of dated orders (3/day for the last week, down to 1 every other day), so every dashboard window has data. Re-running V5 gives the same result.
- The DWH shifts the demo orders forward once per day (`backend/src/handlers/dwh/demo.ts`), so the dates stay current without adding new rows.
- Production: `cd backend && npx wrangler d1 execute db-prod --remote --file=../database/sqlite/V5__Refresh_Demo_Orders.sql` (one time).

## Earlier hosting

Earlier versions ran Postgres on Railway, Supabase, Neon and Render, and the API on Koyeb and Railway (Go backend). Those services are no longer used; the connection strings and credentials were removed from the repository.
