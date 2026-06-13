-- Reseed the bike domain as a SHARED schema "Bike Demo" used by projects 1 AND 2, so selecting both
-- in the picker compiles their data together. NON-DESTRUCTIVE: registers the existing tables
-- (is_managed=FALSE → never altered/dropped). customers/bikes already carry a project_id column
-- (the discriminator); bike_models is global (project_column NULL).

INSERT INTO dwh_schemas (name, created_by) VALUES ('Bike Demo', 'system');

UPDATE projects SET schema_id = (SELECT id FROM dwh_schemas WHERE name = 'Bike Demo') WHERE id IN (1, 2);

INSERT INTO dwh_entities (schema_id, name, display_name, physical_table, project_column, is_managed)
SELECT id, 'bike_models', 'Bike Models', 'bike_models', NULL,         FALSE FROM dwh_schemas WHERE name = 'Bike Demo';
INSERT INTO dwh_entities (schema_id, name, display_name, physical_table, project_column, is_managed)
SELECT id, 'customers',   'Customers',   'customers',   'project_id', FALSE FROM dwh_schemas WHERE name = 'Bike Demo';
INSERT INTO dwh_entities (schema_id, name, display_name, physical_table, project_column, is_managed)
SELECT id, 'bikes',       'Bikes',       'bikes',       'project_id', FALSE FROM dwh_schemas WHERE name = 'Bike Demo';

-- bike_models (global)
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'id', 'ID', 'integer', 0, TRUE FROM dwh_entities WHERE physical_table = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'name', 'Name', 'text', 1 FROM dwh_entities WHERE physical_table = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'saddle_id', 'Saddle', 'integer', 2 FROM dwh_entities WHERE physical_table = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'frame_id', 'Frame', 'integer', 3 FROM dwh_entities WHERE physical_table = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'fork_id', 'Fork', 'integer', 4 FROM dwh_entities WHERE physical_table = 'bike_models';

-- customers (project_id discriminator)
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'id', 'ID', 'integer', 0, TRUE FROM dwh_entities WHERE physical_table = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'email', 'Email', 'text', 1 FROM dwh_entities WHERE physical_table = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'first_name', 'First name', 'text', 2 FROM dwh_entities WHERE physical_table = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'name', 'Name', 'text', 3 FROM dwh_entities WHERE physical_table = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'dob', 'Date of birth', 'date', 4 FROM dwh_entities WHERE physical_table = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'city', 'City', 'text', 5 FROM dwh_entities WHERE physical_table = 'customers';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'project_id', 'Project', 'integer', 6, TRUE FROM dwh_entities WHERE physical_table = 'customers';

-- bikes (model_id reference -> bike_models; project_id discriminator)
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'id', 'ID', 'integer', 0, TRUE FROM dwh_entities WHERE physical_table = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, ref_entity_id, on_delete)
    SELECT b.id, 'model_id', 'Model', 'reference', 1, m.id, 'restrict'
    FROM dwh_entities b, dwh_entities m WHERE b.physical_table = 'bikes' AND m.physical_table = 'bike_models';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'serial_number', 'Serial', 'text', 2 FROM dwh_entities WHERE physical_table = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'production_date', 'Produced', 'date', 3 FROM dwh_entities WHERE physical_table = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'quantity', 'Quantity', 'integer', 4 FROM dwh_entities WHERE physical_table = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position) SELECT id, 'warehouse_location', 'Location', 'text', 5 FROM dwh_entities WHERE physical_table = 'bikes';
INSERT INTO dwh_columns (entity_id, name, display_name, data_type, position, is_system) SELECT id, 'project_id', 'Project', 'integer', 6, TRUE FROM dwh_entities WHERE physical_table = 'bikes';
