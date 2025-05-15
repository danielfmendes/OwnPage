-- Projekte einfügen
INSERT INTO projects (name)
VALUES ('Standardprojekt');

-- Benutzer einfügen
INSERT INTO users (email, username, password, dob, is_verified, verification_expires, verification_token)
VALUES
    ('testcreator@example.com', 'TestCreator', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '1970-01-01 00:00:00.000000', true, null, null),
    ('testadmin@example.com', 'TestAdmin', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '1970-01-01 00:00:00.000000', true, null, null),
    ('testuser@example.com', 'TestUser', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '1970-01-01 00:00:00.000000', true, null, null);

-- Rollenzuweisung
INSERT INTO role_management (useremail, project_id, role)
VALUES
    ('testcreator@example.com', 1, 'creator'),
    ('testadmin@example.com', 1, 'admin'),
    ('testuser@example.com', 1, 'user');

-- Kunden einfügen
INSERT INTO customers (email, password, first_name, name, dob, city, project_id)
VALUES
    ('max@example.com', 'pass123', 'Max', 'Mustermann', '1970-01-01 00:00:00.000000', 'Berlin', 1),
    ('erika@example.com', 'pass123', 'Erika', 'Musterfrau', '1970-01-01 00:00:00.000000', 'München', 1),
    ('hans@example.com', 'pass123', 'Hans', 'Meier', '1970-01-01 00:00:00.000000', 'Hamburg', 1),
    ('julia@example.com', 'pass123', 'Julia', 'Schulz', '1970-01-01 00:00:00.000000', 'Köln', 1),
    ('tom@example.com', 'pass123', 'Tom', 'Becker', '1970-01-01 00:00:00.000000', 'Frankfurt', 1),
    ('anna@example.com', 'pass123', 'Anna', 'Fischer', '1970-01-01 00:00:00.000000', 'Leipzig', 1),
    ('lukas@example.com', 'pass123', 'Lukas', 'Wolf', '1970-01-01 00:00:00.000000', 'Stuttgart', 1);

-- Fahrräder
INSERT INTO bikes (model_id, serial_number, production_date, quantity, warehouse_location, project_id)
VALUES
    (1, 'SN1001', '2024-01-15',1, 'WH-A1', 1),
    (2, 'SN1002', '2024-02-10',2, 'WH-A2', 1),
    (1, 'SN1003', '2024-03-12',3, 'WH-A3', 1),
    (2, 'SN1004', '2024-04-01',4, 'WH-B1', 1),
    (1, 'SN1005', '2024-05-20',5, 'WH-B2', 1),
    (2, 'SN1006', '2024-06-18',6, 'WH-B3', 1),
    (1, 'SN1007', '2024-07-11',7, 'WH-C1', 1),
    (2, 'SN1008', '2024-08-23',8, 'WH-C2', 1);

-- Lagerteile
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'saddle', id, 10 + id, 'R1', 1 FROM saddles;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'frame', id, 5 + id, 'R2', 1 FROM frames;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'fork', id, 7 + id, 'R3', 1 FROM forks;

-- Teilekosten
INSERT INTO part_costs (part_type, part_id, cost, project_id)
SELECT 'saddle', id, 49.99 + id * 10, 1 FROM saddles;
INSERT INTO part_costs (part_type, part_id, cost, project_id)
SELECT 'frame', id, 199.99 + id * 50, 1 FROM frames;
INSERT INTO part_costs (part_type, part_id, cost, project_id)
SELECT 'fork', id, 149.99 + id * 30, 1 FROM forks;