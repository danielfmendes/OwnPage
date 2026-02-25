-- Insert projects
INSERT INTO projects (name)
VALUES 
    ('Standard Project'),
    ('E-Bike Expansion');

-- Insert users
INSERT INTO users (email, username, password, dob, is_verified, verification_expires, verification_token)
VALUES
    ('testcreator@example.com', 'TestCreator', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '1970-01-01 00:00:00.000000', true, null, null),
    ('testadmin@example.com', 'TestAdmin', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '1970-01-01 00:00:00.000000', true, null, null),
    ('testuser@example.com', 'TestUser', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '1970-01-01 00:00:00.000000', true, null, null);

-- Role assignment (Project 1 - Standard)
INSERT INTO role_management (useremail, project_id, role)
VALUES
    ('testcreator@example.com', 1, 'creator'),
    ('testadmin@example.com', 1, 'admin'),
    ('testuser@example.com', 1, 'user');

-- Role assignment (Project 2 - E-Bike)
INSERT INTO role_management (useremail, project_id, role)
VALUES
    ('testadmin@example.com', 2, 'creator'),
    ('testcreator@example.com', 2, 'admin'),
    ('testuser@example.com', 2, 'user');

-- Insert customers
INSERT INTO customers (email, password, first_name, name, dob, city, project_id)
VALUES
    -- Project 1
    ('max@example.com', 'pass123', 'Max', 'Mustermann', '1970-01-01 00:00:00.000000', 'Berlin', 1),
    ('erika@example.com', 'pass123', 'Erika', 'Musterfrau', '1970-01-01 00:00:00.000000', 'Munich', 1),
    ('hans@example.com', 'pass123', 'Hans', 'Meier', '1970-01-01 00:00:00.000000', 'Hamburg', 1),
    ('julia@example.com', 'pass123', 'Julia', 'Schulz', '1970-01-01 00:00:00.000000', 'Cologne', 1),
    -- Project 2
    ('sophie@example.com', 'pass123', 'Sophie', 'Wagner', '1985-04-12 00:00:00.000', 'Dusseldorf', 2),
    ('leon@example.com', 'pass123', 'Leon', 'Weber', '1990-08-22 00:00:00.000', 'Bremen', 2),
    ('marie@example.com', 'pass123', 'Marie', 'Hoffmann', '1992-11-05 00:00:00.000', 'Hanover', 2);

-- Bikes
INSERT INTO bikes (model_id, serial_number, production_date, quantity, warehouse_location, project_id)
VALUES
    -- Project 1
    (1, 'SN1001', '2024-01-15',1, 'WH-A1', 1),
    (2, 'SN1002', '2024-02-10',2, 'WH-A2', 1),
    (3, 'SN1003', '2024-03-12',3, 'WH-A3', 1),
    (4, 'SN1004', '2024-04-01',4, 'WH-B1', 1),
    -- Project 2
    (5, 'SN2001', '2024-05-20',5, 'WH-E2', 2),
    (6, 'SN2002', '2024-06-18',6, 'WH-E3', 2),
    (7, 'SN2003', '2024-07-11',7, 'WH-E1', 2),
    (8, 'SN2004', '2024-08-23',8, 'WH-E2', 2);

-- Warehouse parts
-- Project 1
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'saddle', id, 10 + id, 'R1', 1 FROM saddles WHERE id <= 3;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'frame', id, 5 + id, 'R2', 1 FROM frames WHERE id <= 3;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'fork', id, 7 + id, 'R3', 1 FROM forks WHERE id <= 3;

-- Project 2
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'saddle', id, 20 + id * 2, 'R4', 2 FROM saddles WHERE id > 3;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'frame', id, 15 + id, 'R5', 2 FROM frames WHERE id > 3;
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location, project_id)
SELECT 'fork', id, 12 + id * 3, 'R6', 2 FROM forks WHERE id > 3;

-- Part costs
-- Project 1
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'saddle', id, 49.99 + id * 10, 1 FROM saddles;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'frame', id, 199.99 + id * 50, 1 FROM frames;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'fork', id, 149.99 + id * 30, 1 FROM forks;

-- Project 2
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'saddle', id, 59.99 + id * 10, 2 FROM saddles;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'frame', id, 229.99 + id * 45, 2 FROM frames;
INSERT INTO part_costs (part_type, part_id, cost, project_id) SELECT 'fork', id, 169.99 + id * 25, 2 FROM forks;