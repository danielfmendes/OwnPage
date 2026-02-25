-- ==========================================================
-- GENERATE ORDERS (Simulation of loops via CTE)
-- ==========================================================

-- LAST WEEK: 20 Orders per project
INSERT INTO orders (customer_id, order_date, project_id)
WITH RECURSIVE cnt(i) AS (
    SELECT 1 UNION ALL SELECT i + 1 FROM cnt WHERE i < 20
)
SELECT
    (i % 4) + 1,
    datetime('now', '-7 days', '+' || (i * 8) || ' hours'),
    1
FROM cnt
UNION ALL
SELECT
    (i % 3) + 5,
    datetime('now', '-7 days', '+' || (i * 8) || ' hours'),
    2
FROM cnt;

-- LAST MONTH: 20 Orders per project
INSERT INTO orders (customer_id, order_date, project_id)
WITH RECURSIVE cnt(i) AS (
    SELECT 1 UNION ALL SELECT i + 1 FROM cnt WHERE i < 20
)
SELECT
    (i % 4) + 1,
    date('now', '-30 days', '+' || (i * 1.5) || ' days'),
    1
FROM cnt
UNION ALL
SELECT
    (i % 3) + 5,
    date('now', '-30 days', '+' || (i * 1.5) || ' days'),
    2
FROM cnt;

-- LAST YEAR: 20 Orders per project
INSERT INTO orders (customer_id, order_date, project_id)
WITH RECURSIVE cnt(i) AS (
    SELECT 1 UNION ALL SELECT i + 1 FROM cnt WHERE i < 20
)
SELECT
    (i % 4) + 1,
    date('now', '-365 days', '+' || (i * 18) || ' days'),
    1
FROM cnt
UNION ALL
SELECT
    (i % 3) + 5,
    date('now', '-365 days', '+' || (i * 18) || ' days'),
    2
FROM cnt;

-- ==========================================================
-- ADD ORDER ITEMS
-- ==========================================================
-- We take the last 120 generated orders and add an item to each.
-- We use ABS(RANDOM() % 4) to pick bikes 1-4 for Project 1 and 5-8 for Project 2

INSERT INTO order_items (order_id, bike_id, number, price)
SELECT
    id,
    CASE 
        WHEN project_id = 1 THEN (ABS(RANDOM()) % 4) + 1 
        ELSE (ABS(RANDOM()) % 4) + 5 
    END,                           -- Random Bike-ID based on project
    (ABS(RANDOM()) % 4) + 1,               -- Random quantity (1-4)
    ROUND(800 + (ABS(RANDOM()) % 1000), 2) -- Random price (800-1800)
FROM (SELECT id, project_id FROM orders ORDER BY id DESC LIMIT 120);