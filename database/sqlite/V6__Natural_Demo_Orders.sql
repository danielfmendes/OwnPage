-- ==========================================================
-- REFRESH DEMO ORDERS, NATURAL SHAPE (projects 1 and 2 only, deterministic)
-- ==========================================================
-- Replaces V5. Same window as V5 (day offsets 0..729, dates relative to the day this runs),
-- but the volume, customers, bikes and prices look like a real shop instead of a pattern:
--   - about 60% of slots become an order on a weekday, about 39% on a weekend, drifting slightly
--     down with age, so recent weeks are a little busier than last year
--   - customers are weighted 38/27/20/15 % by rank, so some cities sell more than others
--   - bikes are weighted 34/26/22/18 %, with a fixed price per model
--   - quantity is 1 (82 %) or 2 (18 %), with a small price jitter per order
-- Randomness comes from a fixed integer hash of the slot or order id, so re-running gives the same data.
--
-- Customers and bikes are picked from the rows that exist in the target database (ids differ
-- between the local seed and production), so the foreign keys always resolve.
--
-- Safe to re-run: it deletes and recreates only projects 1 and 2.
-- Production:
--   cd backend && npx wrangler d1 execute db-prod --remote --file=../database/sqlite/V6__Natural_Demo_Orders.sql

DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE project_id IN (1, 2));
DELETE FROM orders WHERE project_id IN (1, 2);

-- Recursive CTEs instead of long UNION ALL lists: D1 rejects compound SELECTs with too many terms.
WITH RECURSIVE days(d) AS (
    SELECT 0 UNION ALL SELECT d + 1 FROM days WHERE d < 729
),
slot_no(n) AS (
    SELECT 1 UNION ALL SELECT n + 1 FROM slot_no WHERE n < 7
),
raw AS (
    SELECT days.d, slot_no.n, pr.p, days.d * 131 + slot_no.n * 17 + pr.p * 7919 + 1 AS s
    FROM days
    CROSS JOIN slot_no
    CROSS JOIN (SELECT 1 AS p UNION ALL SELECT 2) AS pr
),
hashed AS (
    SELECT d, n, p,
           (((s * 1103515245 + 12345) % 2147483648) * 1103515245 + 12345) % 2147483648 AS h,
           CAST(strftime('%w', date('now', '-' || d || ' days')) AS INTEGER) IN (0, 6) AS wk
    FROM raw
),
slots AS (
    SELECT hashed.d, hashed.n, hashed.p,
           (h / 65536) % 100 AS r,
           (h / 256) % 100 AS rc,
           (43740 - 12 * d) * (CASE WHEN wk THEN 65 ELSE 100 END) / 72900 AS thr,
           (SELECT COUNT(*) FROM customers c WHERE c.project_id = hashed.p) AS cnt
    FROM hashed
)
INSERT INTO orders (customer_id, order_date, project_id)
SELECT
    (SELECT c.id FROM customers c
        WHERE c.project_id = s.p
          AND (SELECT COUNT(*) FROM customers c2 WHERE c2.project_id = c.project_id AND c2.id < c.id)
              = ((CASE WHEN s.rc < 38 THEN 0 WHEN s.rc < 65 THEN 1 WHEN s.rc < 85 THEN 2 ELSE 3 END) % s.cnt)),
    date('now', '-' || s.d || ' days'),
    s.p
FROM slots s
WHERE s.r < s.thr
ORDER BY s.d, s.p, s.n;

-- One item per new order. The bike rank, quantity and price come from a hash of the order id.
WITH base AS (
    SELECT o.id, o.project_id, ((o.id * 7919 + 3) * 1103515245 + 12345) % 2147483648 AS h1
    FROM orders o
    WHERE o.project_id IN (1, 2)
),
rolled AS (
    SELECT id, project_id, (h1 * 1103515245 + 12345) % 2147483648 AS h2 FROM base
),
picked AS (
    SELECT id, project_id, h2,
           CASE WHEN (h2 / 65536) % 100 < 34 THEN 0
                WHEN (h2 / 65536) % 100 < 60 THEN 1
                WHEN (h2 / 65536) % 100 < 82 THEN 2
                ELSE 3 END AS brank,
           CASE WHEN (h2 / 4096) % 100 < 82 THEN 1 ELSE 2 END AS qty,
           (h2 / 256) % 41 AS jit
    FROM rolled
)
INSERT INTO order_items (order_id, bike_id, number, price)
SELECT
    p.id,
    (SELECT b.id FROM bikes b
        WHERE b.project_id = p.project_id
          AND (SELECT COUNT(*) FROM bikes b2 WHERE b2.project_id = b.project_id AND b2.id < b.id)
              = (p.brank % (SELECT COUNT(*) FROM bikes b3 WHERE b3.project_id = p.project_id))),
    p.qty,
    CASE p.brank WHEN 0 THEN 1190 WHEN 1 THEN 1590 WHEN 2 THEN 2190 ELSE 2690 END
        + CASE WHEN p.project_id = 2 THEN 1200 ELSE 0 END
        + p.jit
FROM picked p;
