-- ==========================================================
-- REFRESH DEMO ORDERS (projects 1 and 2 only, deterministic)
-- ==========================================================
-- Postgres twin of database/sqlite/V5__Refresh_Demo_Orders.sql. Same data shape:
--   days 0-6 : 3 orders/day, days 7-29 : 2/day, days 30-364 : 1/day, days 365-729 : 1 on even offsets
-- One order_items row per order, quantity 1.
-- Dates are relative to CURRENT_DATE when this runs. Re-runnable.

DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE project_id IN (1, 2));
DELETE FROM orders WHERE project_id IN (1, 2);

INSERT INTO orders (customer_id, order_date, project_id)
SELECT
    CASE WHEN p = 1 THEN ((d + n) % 4) + 1 ELSE ((d + n) % 3) + 5 END,
    CURRENT_DATE - d,
    p
FROM generate_series(0, 729) AS d
CROSS JOIN generate_series(1, 3) AS n
CROSS JOIN (VALUES (1), (2)) AS pr(p)
WHERE (d < 7 AND n <= 3)
   OR (d BETWEEN 7 AND 29 AND n <= 2)
   OR (d BETWEEN 30 AND 364 AND n = 1)
   OR (d >= 365 AND d % 2 = 0 AND n = 1);

-- One item per new order: bikes 1-4 for project 1, 5-8 for project 2; unit price 800-1799.
INSERT INTO order_items (order_id, bike_id, number, price)
SELECT
    id,
    CASE WHEN project_id = 1 THEN (id % 4) + 1 ELSE (id % 4) + 5 END,
    1,
    800 + ((id * 37) % 1000)
FROM orders
WHERE project_id IN (1, 2);
