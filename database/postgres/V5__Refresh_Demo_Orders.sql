-- ==========================================================
-- REFRESH DEMO ORDERS (projects 1 and 2 only, deterministic)
-- ==========================================================
-- Postgres twin of database/sqlite/V5__Refresh_Demo_Orders.sql. Same data shape:
--   days 0-6 : 3 orders/day, days 7-29 : 2/day, days 30-364 : 1/day, days 365-729 : 1 on even offsets
-- One order_items row per order, quantity 1. Customers and bikes are picked from the rows that
-- exist in the target database, so the foreign keys always resolve.
-- Runs in one transaction. Re-runnable.

BEGIN;

DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE project_id IN (1, 2));
DELETE FROM orders WHERE project_id IN (1, 2);

WITH slots AS (
    SELECT d, n, pr.p,
           (SELECT COUNT(*) FROM customers c WHERE c.project_id = pr.p) AS cnt
    FROM generate_series(0, 729) AS d
    CROSS JOIN generate_series(1, 3) AS n
    CROSS JOIN (VALUES (1), (2)) AS pr(p)
    WHERE (d < 7 AND n <= 3)
       OR (d BETWEEN 7 AND 29 AND n <= 2)
       OR (d BETWEEN 30 AND 364 AND n = 1)
       OR (d >= 365 AND d % 2 = 0 AND n = 1)
)
INSERT INTO orders (customer_id, order_date, project_id)
SELECT
    (SELECT c.id FROM customers c
        WHERE c.project_id = slots.p
          AND (SELECT COUNT(*) FROM customers c2 WHERE c2.project_id = c.project_id AND c2.id < c.id) = (slots.d + slots.n) % slots.cnt),
    CURRENT_DATE - slots.d,
    slots.p
FROM slots;

-- One item per new order, bike picked from the same project's bikes.
INSERT INTO order_items (order_id, bike_id, number, price)
SELECT
    o.id,
    (SELECT b.id FROM bikes b
        WHERE b.project_id = o.project_id
          AND (SELECT COUNT(*) FROM bikes b2 WHERE b2.project_id = b.project_id AND b2.id < b.id) = o.id % (SELECT COUNT(*) FROM bikes b3 WHERE b3.project_id = o.project_id)),
    1,
    800 + ((o.id * 37) % 1000)
FROM orders o
WHERE o.project_id IN (1, 2);

COMMIT;
