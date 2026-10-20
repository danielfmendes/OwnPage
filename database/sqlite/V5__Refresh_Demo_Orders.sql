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
-- Safe to re-run: it deletes and recreates only projects 1 and 2.
-- Production:
--   cd backend && npx wrangler d1 execute db-prod --remote --file=../database/sqlite/V5__Refresh_Demo_Orders.sql

DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE project_id IN (1, 2));
DELETE FROM orders WHERE project_id IN (1, 2);

WITH RECURSIVE days(d) AS (
    SELECT 0 UNION ALL SELECT d + 1 FROM days WHERE d < 729
),
slots AS (
    SELECT days.d, k.n, pr.p
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
    CASE WHEN p = 1 THEN ((d + n) % 4) + 1 ELSE ((d + n) % 3) + 5 END,
    date('now', '-' || d || ' days'),
    p
FROM slots;

-- One item per new order: bikes 1-4 for project 1, 5-8 for project 2; unit price 800-1799.
INSERT INTO order_items (order_id, bike_id, number, price)
SELECT
    id,
    CASE WHEN project_id = 1 THEN (id % 4) + 1 ELSE (id % 4) + 5 END,
    1,
    800 + ((id * 37) % 1000)
FROM orders
WHERE project_id IN (1, 2);
