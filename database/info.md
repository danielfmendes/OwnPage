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

## Earlier hosting

Earlier versions ran Postgres on Railway, Supabase, Neon and Render, and the API on Koyeb and Railway (Go backend). Those services are no longer used; the connection strings and credentials were removed from the repository.
