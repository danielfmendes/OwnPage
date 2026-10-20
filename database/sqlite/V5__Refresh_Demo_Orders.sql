-- ==========================================================
-- REFRESH DEMO ORDERS (projects 1 and 2 only, deterministic)
-- ==========================================================
-- Replaces the demo orders of the two demo projects with a dense, dated history that
-- covers every dashboard window (1D, 1W, 1M, 1Y, MAX) and its "previous period".
-- Dates are relative to the day this runs; backend/src/handlers/dwh/demo.ts keeps them
-- current afterwards by shifting them forward, so this file is only needed once per DB.
--
-- Per project, for day offsets 0..729 (today back to ~2 years):
--   days 0-6    : 3 orders/day
--   days 7-29   : 2 orders/day
--   days 30-364 : 1 order/day
--   days 365-729: 1 order on even offsets
-- One order_items row per order, quantity 1, so "Number of Sales" equals the order count.
--
-- Customers and bikes are picked from the rows that exist in the target database (ids differ
-- between the local seed and production), so the foreign keys always resolve. Projects must
-- have at least one customer and one bike (the V3 seed guarantees this).
--
-- Safe to re-run: it deletes and recreates only projects 1 and 2.
-- Production:
--   cd backend && npx wrangler d1 execute db-prod --remote --file=../database/sqlite/V5__Refresh_Demo_Orders.sql

DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE project_id IN (1, 2));
DELETE FROM orders WHERE project_id IN (1, 2);

WITH RECURSIVE days(d) AS (
    SELECT 0 UNION ALL SELECT d + 1 FROM days WHERE d < 729
),
slots AS (
    SELECT days.d, k.n, pr.p,
           (SELECT COUNT(*) FROM customers c WHERE c.project_id = pr.p) AS cnt
    FROM days
    CROSS JOIN (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3) AS k
    CROSS JOIN (SELECT 1 AS p UNION ALL SELECT 2) AS pr
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
    date('now', '-' || slots.d || ' days'),
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
