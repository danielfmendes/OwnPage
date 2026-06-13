-- DWH catalog (Postgres), schema-centric: a SCHEMA is a reusable definition of entities/columns;
-- MANY projects can share one schema. Physical tables live per schema (s{schemaId}_{name}) and
-- carry a project_id discriminator column, so projects sharing a schema store rows together and a
-- multi-project selection compiles via WHERE project_id IN (...). Idempotent for out-of-band prod D1.

CREATE TABLE IF NOT EXISTS dwh_schemas
(
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL,
    created_by TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Projects reference a schema (nullable until one is chosen). projects itself is created in V0.
ALTER TABLE projects ADD COLUMN IF NOT EXISTS schema_id INT REFERENCES dwh_schemas (id);

CREATE TABLE IF NOT EXISTS dwh_entities
(
    id             SERIAL PRIMARY KEY,
    schema_id      INT  NOT NULL REFERENCES dwh_schemas (id),
    name           TEXT NOT NULL,
    display_name   TEXT,
    physical_table TEXT NOT NULL UNIQUE,
    project_column TEXT,
    is_managed     BOOLEAN   NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS dwh_entities_schema_name ON dwh_entities (schema_id, name);

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

-- One dashboard config (JSON) per schema, shared by all its projects.
CREATE TABLE IF NOT EXISTS dwh_dashboards
(
    id         SERIAL PRIMARY KEY,
    schema_id  INT NOT NULL UNIQUE REFERENCES dwh_schemas (id),
    config     TEXT,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
