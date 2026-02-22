-- Projekte einfügen
INSERT INTO projects (name)
VALUES 
    ('Standardprojekt'),
    ('E-Bike Expansion'),
    ('Mountainbike Series');

-- Benutzer einfügen
INSERT INTO users (email, username, password, dob, is_verified, verification_expires, verification_token)
VALUES
    ('testcreator@example.com', 'TestCreator', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '1970-01-01 00:00:00.000', 1, null, null),
    ('testadmin@example.com', 'TestAdmin', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '1970-01-01 00:00:00.000', 1, null, null),
    ('testuser@example.com', 'TestUser', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '1970-01-01 00:00:00.000', 1, null, null);

-- Rollenzuweisung (Project 1 - Standard)
INSERT INTO role_management (useremail, project_id, role)
VALUES
    ('testcreator@example.com', 1, 'creator'),
    ('testadmin@example.com', 1, 'admin'),
    ('testuser@example.com', 1, 'user');

-- Rollenzuweisung (Project 2 - E-Bike Expansion)
INSERT INTO role_management (useremail, project_id, role)
VALUES
    ('testadmin@example.com', 2, 'creator'),
    ('testcreator@example.com', 2, 'admin'),
    ('testuser@example.com', 2, 'user');

-- Rollenzuweisung (Project 3 - Mountain Series)
INSERT INTO role_management (useremail, project_id, role)
VALUES
    ('testuser@example.com', 3, 'creator'),
    ('testcreator@example.com', 3, 'user');

-- Kunden einfügen
INSERT INTO customers (email, password, first_name, name, dob, city, project_id)
VALUES
    -- Project 1
    ('max@example.com', 'pass123', 'Max', 'Mustermann', '1970-01-01 00:00:00.000', 'Berlin', 1),
    ('erika@example.com', 'pass123', 'Erika', 'Musterfrau', '1970-01-01 00:00:00.000', 'München', 1),
    ('hans@example.com', 'pass123', 'Hans', 'Meier', '1970-01-01 00:00:00.000', 'Hamburg', 1),
    ('julia@example.com', 'pass123', 'Julia', 'Schulz', '1970-01-01 00:00:00.000', 'Köln', 1),
    ('tom@example.com', 'pass123', 'Tom', 'Becker', '1970-01-01 00:00:00.000', 'Frankfurt', 1),
    ('anna@example.com', 'pass123', 'Anna', 'Fischer', '1970-01-01 00:00:00.000', 'Leipzig', 1),
    ('lukas@example.com', 'pass123', 'Lukas', 'Wolf', '1970-01-01 00:00:00.000', 'Stuttgart', 1),
    -- Project 2
    ('sophie@example.com', 'pass123', 'Sophie', 'Wagner', '1985-04-12 00:00:00.000', 'Düsseldorf', 2),
    ('leon@example.com', 'pass123', 'Leon', 'Weber', '1990-08-22 00:00:00.000', 'Bremen', 2),
    ('marie@example.com', 'pass123', 'Marie', 'Hoffmann', '1992-11-05 00:00:00.000', 'Hannover', 2),
    ('felix@example.com', 'pass123', 'Felix', 'Schäfer', '1988-02-14 00:00:00.000', 'Nürnberg', 2),
    ('laura@example.com', 'pass123', 'Laura', 'Koch', '1995-07-30 00:00:00.000', 'Duisburg', 2),
    -- Project 3
    ('jonas@example.com', 'pass123', 'Jonas', 'Richter', '1982-09-18 00:00:00.000', 'Bochum', 3),
    ('lea@example.com', 'pass123', 'Lea', 'Klein', '1991-03-25 00:00:00.000', 'Wuppertal', 3),
    ('Tim@example.com', 'pass123', 'Tim', 'Kröger', '1989-12-08 00:00:00.000', 'Bielefeld', 3);

-- Fahrräder (Project 1)
INSERT INTO bikes (model_id, serial_number, production_date, quantity, warehouse_location, project_id)
VALUES
    (1, 'SN1001', '2024-01-15', 1, 'WH-A1', 1),
    (2, 'SN1002', '2024-02-10', 2, 'WH-A2', 1),
    (3, 'SN1003', '2024-03-12', 3, 'WH-A3', 1),
    (4, 'SN1004', '2024-04-01', 4, 'WH-B1', 1),
    (5, 'SN1005', '2024-05-20', 5, 'WH-B2', 1),
    (6, 'SN1006', '2024-06-18', 6, 'WH-B3', 1),
    (7, 'SN1007', '2024-07-11', 7, 'WH-C1', 1),
    (8, 'SN1008', '2024-08-23', 8, 'WH-C2', 1);

-- Fahrräder (Project 2)
INSERT INTO bikes (model_id, serial_number, production_date, quantity, warehouse_location, project_id)
VALUES
    (1, 'SN2001', '2024-02-05', 4, 'WH-E1', 2),
    (2, 'SN2002', '2024-03-15', 12, 'WH-E2', 2),
    (4, 'SN2003', '2024-04-20', 8, 'WH-E3', 2),
    (5, 'SN2004', '2024-05-10', 15, 'WH-E4', 2),
    (8, 'SN2005', '2024-06-05', 20, 'WH-E5', 2);

-- Fahrräder (Project 3)
INSERT INTO bikes (model_id, serial_number, production_date, quantity, warehouse_location, project_id)
VALUES
    (3, 'SN3001', '2024-01-20', 10, 'WH-M1', 3),
    (6, 'SN3002', '2024-03-22', 25, 'WH-M2', 3),
    (7, 'SN3003', '2024-05-30', 18, 'WH-M3', 3);

-- Lagerteile (Project 1)
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'saddle', id, 10 + id, 'R1', 1 FROM saddles;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'frame', id, 5 + id, 'R2', 1 FROM frames;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'fork', id, 7 + id, 'R3', 1 FROM forks;

-- Lagerteile (Project 2)
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'saddle', id, 20 + id * 2, 'R4', 2 FROM saddles WHERE id % 2 = 0;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'frame', id, 15 + id, 'R5', 2 FROM frames WHERE id % 2 = 1;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'fork', id, 12 + id * 3, 'R6', 2 FROM forks WHERE id <= 5;

-- Lagerteile (Project 3)
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'saddle', id, 30, 'R7', 3 FROM saddles WHERE id > 3;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'frame', id, 25, 'R8', 3 FROM frames WHERE id % 3 = 0;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'fork', id, 40, 'R9', 3 FROM forks WHERE id > 4;

-- Teilekosten (Project 1)
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'saddle', id, 49.99 + id * 10, 1 FROM saddles;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'frame', id, 199.99 + id * 50, 1 FROM frames;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'fork', id, 149.99 + id * 30, 1 FROM forks;

-- Teilekosten (Project 2 - Slightly more expensive)
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'saddle', id, 59.99 + id * 10, 2 FROM saddles;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'frame', id, 229.99 + id * 45, 2 FROM frames;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'fork', id, 169.99 + id * 25, 2 FROM forks;

-- Teilekosten (Project 3 - Bulk discount)
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'saddle', id, 39.99 + id * 8, 3 FROM saddles;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'frame', id, 179.99 + id * 40, 3 FROM frames;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'fork', id, 129.99 + id * 20, 3 FROM forks;