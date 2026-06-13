-- DWH catalog (SQLite / Cloudflare D1), schema-centric. A SCHEMA is a reusable definition of
-- entities/columns shared by many projects. Physical tables live per schema (s{schemaId}_{name})
-- and carry a project_id discriminator. Idempotent for out-of-band prod D1 application:
--   npx wrangler d1 execute db-prod --file=backend/init_sqlite/V5__Create_DWH_Catalog.sql --remote

CREATE TABLE IF NOT EXISTS dwh_schemas
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    created_by TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- projects is created in V0; add the schema reference (SQLite has no ADD COLUMN IF NOT EXISTS, so
-- this V5 must be applied exactly once — Flyway/version-gated locally; one-shot on prod D1).
ALTER TABLE projects ADD COLUMN schema_id INTEGER REFERENCES dwh_schemas (id);

CREATE TABLE IF NOT EXISTS dwh_entities
(
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id      INTEGER NOT NULL REFERENCES dwh_schemas (id),
    name           TEXT    NOT NULL,
    display_name   TEXT,
    physical_table TEXT    NOT NULL UNIQUE,
    project_column TEXT,
    is_managed     INTEGER NOT NULL DEFAULT 1,
    created_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS dwh_entities_schema_name ON dwh_entities (schema_id, name);

CREATE TABLE IF NOT EXISTS dwh_columns
(
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_id     INTEGER NOT NULL REFERENCES dwh_entities (id),
    name          TEXT    NOT NULL,
    display_name  TEXT,
    data_type     TEXT    NOT NULL CHECK (data_type IN ('text', 'integer', 'real', 'boolean', 'date', 'datetime', 'reference')),
    is_nullable   INTEGER NOT NULL DEFAULT 1,
    is_unique     INTEGER NOT NULL DEFAULT 0,
    default_value TEXT,
    position      INTEGER NOT NULL DEFAULT 0,
    ref_entity_id INTEGER REFERENCES dwh_entities (id),
    on_delete     TEXT DEFAULT 'restrict' CHECK (on_delete IN ('restrict', 'cascade', 'set_null')),
    is_system     INTEGER NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS dwh_columns_entity_name ON dwh_columns (entity_id, name);

CREATE TABLE IF NOT EXISTS dwh_dashboards
(
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    schema_id  INTEGER NOT NULL UNIQUE REFERENCES dwh_schemas (id),
    config     TEXT,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
