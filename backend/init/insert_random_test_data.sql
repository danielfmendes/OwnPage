-- Projekte einfügen
INSERT INTO projects (id, name)
VALUES (1, 'Standardprojekt');

-- Benutzer einfügen
INSERT INTO users (email, username, password, dob)
VALUES
    ('testadmin@example.com', 'TestAdmin', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '2025-05-07 00:00:00.000000'),
    ('testuser@example.com', 'TestUser', '$2a$10$bV6Y1MkhtHazexatXn.aAe9JApKjWUlgY7qKBl7gnqRAOS1DUj30q', '2025-05-07 00:00:00.000000');

-- Rollenzuweisung
INSERT INTO role_management (useremail, projectid, role)
VALUES
    ('testadmin@example.com', 1, 'admin'),
    ('testuser@example.com', 1, 'user');

-- Kunden einfügen
INSERT INTO customers (email, password, first_name, name, dob, location, project_id)
VALUES
    ('max@example.com', 'pass123', 'Max', 'Mustermann', NULL, 'Berlin', 1),
    ('erika@example.com', 'pass123', 'Erika', 'Musterfrau', NULL, 'München', 1),
    ('hans@example.com', 'pass123', 'Hans', 'Meier', NULL, 'Hamburg', 1),
    ('julia@example.com', 'pass123', 'Julia', 'Schulz', NULL, 'Köln', 1),
    ('tom@example.com', 'pass123', 'Tom', 'Becker', NULL, 'Frankfurt', 1),
    ('anna@example.com', 'pass123', 'Anna', 'Fischer', NULL, 'Leipzig', 1),
    ('lukas@example.com', 'pass123', 'Lukas', 'Wolf', NULL, 'Stuttgart', 1);

-- Beispielteile einfügen (du solltest diese vorher definieren)
INSERT INTO saddles (name) VALUES ('Sattel A'), ('Sattel B');
INSERT INTO frames (name)  VALUES ('Rahmen A'), ('Rahmen B');
INSERT INTO forks (name)   VALUES ('Gabel A'), ('Gabel B');

-- Fahrradmodelle
INSERT INTO bike_models (name, saddle_id, frame_id, fork_id)
VALUES
    ('Modell 1', 1, 1, 1),
    ('Modell 2', 2, 2, 2);

-- Fahrräder
INSERT INTO bikes (model_id, serial_number, production_date, warehouse_location, project_id)
VALUES
    (1, 'SN1001', '2023-01-15', 'WH-A1', 1),
    (2, 'SN1002', '2023-02-10', 'WH-A2', 1),
    (1, 'SN1003', '2023-03-12', 'WH-A3', 1),
    (2, 'SN1004', '2023-04-01', 'WH-B1', 1),
    (1, 'SN1005', '2023-05-20', 'WH-B2', 1),
    (2, 'SN1006', '2023-06-18', 'WH-B3', 1),
    (1, 'SN1007', '2023-07-11', 'WH-C1', 1),
    (2, 'SN1008', '2023-08-23', 'WH-C2', 1);

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

-- Bestellungen (angenommen Kunden-IDs sind 1 bis 5)
INSERT INTO orders (customer_id, order_date, total_price, project_id)
VALUES
    (1, '2023-09-01', 899.99, 1),
    (2, '2023-09-05', 1099.00, 1),
    (3, '2023-09-10', 1199.50, 1),
    (4, '2023-09-15', 1349.75, 1),
    (5, '2023-09-18', 989.99, 1);

-- Bestellpositionen
INSERT INTO order_items (order_id, bike_id, price)
VALUES
    (1, 1, 899.99),
    (2, 2, 1099.00),
    (3, 3, 1199.50),
    (4, 4, 1349.75),
    (5, 5, 989.99);
