-- DWH catalog (SQLite / Cloudflare D1): metadata describing user-defined entities/columns/relationships.
-- The catalog is the source of truth; physical tables (d_{projectId}_{name}) are generated from it.
-- Idempotent so the same file can be applied to prod D1 out of band:
--   npx wrangler d1 execute db-prod --file=backend/init_sqlite/V5__Create_DWH_Catalog.sql --remote

CREATE TABLE IF NOT EXISTS dwh_entities
(
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id     INTEGER NOT NULL REFERENCES projects (id),
    name           TEXT    NOT NULL,
    display_name   TEXT,
    physical_table TEXT    NOT NULL UNIQUE,
    project_column TEXT,
    is_managed     INTEGER NOT NULL DEFAULT 1,
    created_at     TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS dwh_entities_project_name ON dwh_entities (project_id, name);

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
