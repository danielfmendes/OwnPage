INSERT INTO users (username, password_hash)
VALUES ('alice', 'hash_alice'),
       ('bob', 'hash_bob'),
       ('carol', 'hash_carol'),
       ('dave', 'hash_dave'),
       ('eve', 'hash_eve');


INSERT INTO customers (name, email, location)
VALUES ('Max Mustermann', 'max@example.com', 'Berlin'),
       ('Erika Musterfrau', 'erika@example.com', 'München'),
       ('Hans Meier', 'hans@example.com', 'Hamburg'),
       ('Julia Schulz', 'julia@example.com', 'Köln'),
       ('Tom Becker', 'tom@example.com', 'Frankfurt'),
       ('Anna Fischer', 'anna@example.com', 'Leipzig'),
       ('Lukas Wolf', 'lukas@example.com', 'Stuttgart');


INSERT INTO bikes (model_id, serial_number, production_date, warehouse_location)
VALUES (1, 'SN1001', '2023-01-15', 'WH-A1'),
       (2, 'SN1002', '2023-02-10', 'WH-A2'),
       (3, 'SN1003', '2023-03-12', 'WH-A3'),
       (4, 'SN1004', '2023-04-01', 'WH-B1'),
       (5, 'SN1005', '2023-05-20', 'WH-B2'),
       (6, 'SN1006', '2023-06-18', 'WH-B3'),
       (7, 'SN1007', '2023-07-11', 'WH-C1'),
       (8, 'SN1008', '2023-08-23', 'WH-C2');

-- Sättel
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location)
SELECT 'saddle', id, 10 + id, 'R1'
FROM saddles;

-- Rahmen
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location)
SELECT 'frame', id, 5 + id, 'R2'
FROM frames;

-- Gabeln
INSERT INTO warehouse_parts (part_type, part_id, quantity, storage_location)
SELECT 'fork', id, 7 + id, 'R3'
FROM forks;

-- Beispielpreise für Teile
INSERT INTO part_costs (part_type, part_id, cost)
SELECT 'saddle', id, 49.99 + id * 10
FROM saddles;

INSERT INTO part_costs (part_type, part_id, cost)
SELECT 'frame', id, 199.99 + id * 50
FROM frames;

INSERT INTO part_costs (part_type, part_id, cost)
SELECT 'fork', id, 149.99 + id * 30
FROM forks;


INSERT INTO orders (customer_id, order_date, total_price)
VALUES (1, '2023-09-01', 899.99),
       (2, '2023-09-05', 1099.00),
       (3, '2023-09-10', 1199.50),
       (4, '2023-09-15', 1349.75),
       (5, '2023-09-18', 989.99);

-- Bikes 1–5 werden verkauft
INSERT INTO order_items (order_id, bike_id, price)
VALUES (1, 1, 899.99),
       (2, 2, 1099.00),
       (3, 3, 1199.50),
       (4, 4, 1349.75),
       (5, 5, 989.99);
