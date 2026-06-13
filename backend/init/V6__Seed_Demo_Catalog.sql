-- Register the existing bike tables as catalog entities of project 1 ("Standard Project") so the
-- bike domain is usable through the generic DWH UI — the demo now runs through the new system.
-- NON-DESTRUCTIVE: only inserts catalog rows pointing at existing tables (is_managed = FALSE → the
-- physical tables are never altered or dropped). bikes.model_id is recorded as a catalog reference.

INSERT INTO dwh_entities (project_id, name, display_name, physical_table, project_column, is_managed) VALUES
    (1, 'bike_models', 'Bike Models', 'bike_models', NULL,         FALSE),
    (1, 'customers',   'Customers',   'customers',   'project_id', FALSE),
    (1, 'bikes',       'Bikes',       'bikes',       'project_id', FALSE);

-- bike_models
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'id', 'ID', 'integer', 0, TRUE FROM dwh_entities WHERE project_id = 1 AND name = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'name', 'Name', 'text', 1 FROM dwh_entities WHERE project_id = 1 AND name = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'saddle_id', 'Saddle', 'integer', 2 FROM dwh_entities WHERE project_id = 1 AND name = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'frame_id', 'Frame', 'integer', 3 FROM dwh_entities WHERE project_id = 1 AND name = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'fork_id', 'Fork', 'integer', 4 FROM dwh_entities WHERE project_id = 1 AND name = 'bike_models';

-- customers
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'id', 'ID', 'integer', 0, TRUE FROM dwh_entities WHERE project_id = 1 AND name = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'email', 'Email', 'text', 1 FROM dwh_entities WHERE project_id = 1 AND name = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'first_name', 'First name', 'text', 2 FROM dwh_entities WHERE project_id = 1 AND name = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'name', 'Name', 'text', 3 FROM dwh_entities WHERE project_id = 1 AND name = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'dob', 'Date of birth', 'date', 4 FROM dwh_entities WHERE project_id = 1 AND name = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'city', 'City', 'text', 5 FROM dwh_entities WHERE project_id = 1 AND name = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'project_id', 'Project', 'integer', 6, TRUE FROM dwh_entities WHERE project_id = 1 AND name = 'customers';

-- bikes (model_id is a catalog reference -> bike_models)
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'id', 'ID', 'integer', 0, TRUE FROM dwh_entities WHERE project_id = 1 AND name = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, ref_entity_id, on_delete)
    SELECT b.id, 'model_id', 'Model', 'reference', 1, m.id, 'restrict'
    FROM dwh_entities b, dwh_entities m
    WHERE b.project_id = 1 AND b.name = 'bikes' AND m.project_id = 1 AND m.name = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'serial_number', 'Serial', 'text', 2 FROM dwh_entities WHERE project_id = 1 AND name = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'production_date', 'Produced', 'date', 3 FROM dwh_entities WHERE project_id = 1 AND name = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'quantity', 'Quantity', 'integer', 4 FROM dwh_entities WHERE project_id = 1 AND name = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'warehouse_location', 'Location', 'text', 5 FROM dwh_entities WHERE project_id = 1 AND name = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'project_id', 'Project', 'integer', 6, TRUE FROM dwh_entities WHERE project_id = 1 AND name = 'bikes';
