-- DWH catalog (Postgres): metadata describing user-defined entities/columns/relationships.
-- The catalog is the source of truth; physical tables (d_{projectId}_{name}) are generated from it.
-- Idempotent so the same file can be applied to prod D1 out of band.

CREATE TABLE IF NOT EXISTS dwh_entities
(
    id             SERIAL PRIMARY KEY,
    project_id     INT  NOT NULL REFERENCES projects (id),
    name           TEXT NOT NULL,
    display_name   TEXT,
    physical_table TEXT NOT NULL UNIQUE,
    project_column TEXT,
    is_managed     BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS dwh_entities_project_name ON dwh_entities (project_id, name);

CREATE TABLE IF NOT EXISTS dwh_columns
(
    id            SERIAL PRIMARY KEY,
    entity_id     INT  NOT NULL REFERENCES dwh_entities (id),
    name          TEXT NOT NULL,
    display_name  TEXT,
    data_type     TEXT NOT NULL CHECK (data_type IN ('text', 'integer', 'real', 'boolean', 'date', 'datetime', 'reference')),
    is_nullable   BOOLEAN NOT NULL DEFAULT TRUE,
    is_unique     BOOLEAN NOT NULL DEFAULT FALSE,
    default_value TEXT,
    position      INT     NOT NULL DEFAULT 0,
    ref_entity_id INT REFERENCES dwh_entities (id),
    on_delete     TEXT DEFAULT 'restrict' CHECK (on_delete IN ('restrict', 'cascade', 'set_null')),
    is_system     BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE UNIQUE INDEX IF NOT EXISTS dwh_columns_entity_name ON dwh_columns (entity_id, name);
