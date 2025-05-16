WITH intervals AS (
    SELECT
        CASE $1
            WHEN '1d' THEN INTERVAL '1 day'
            WHEN '1w' THEN INTERVAL '6 days'
            WHEN '1m' THEN INTERVAL '29 days'
            WHEN '1y' THEN INTERVAL '364 days'
            WHEN 'max' THEN NULL
            END AS interval_val
),
     min_date AS (
         SELECT COALESCE(MIN(order_date), CURRENT_DATE) AS min_order_date
         FROM orders
         WHERE project_id = ANY($2)
     ),
     time_ranges AS (
         SELECT
                     CURRENT_DATE::timestamp AS today_start,
                 (CURRENT_DATE + INTERVAL '1 day')::timestamp AS tomorrow_start,
                 CASE
                     WHEN interval_val IS NULL THEN min_order_date::timestamp
                     ELSE (CURRENT_DATE - interval_val)::timestamp
                     END AS start_current,
                     CASE
                         WHEN interval_val IS NULL THEN min_order_date::timestamp
                         ELSE (CURRENT_DATE - (interval_val * 2))::timestamp
                         END AS start_previous,
                     CASE
                         WHEN interval_val IS NULL THEN min_order_date::timestamp
                         ELSE (CURRENT_DATE - interval_val)::timestamp
                         END AS end_previous
         FROM intervals, min_date
     ),
     current_period AS (
         SELECT
             c.city,
             SUM(oi.price * oi.number) AS current_revenue
         FROM order_items oi
                  JOIN orders o ON oi.order_id = o.id
                  JOIN customers c ON o.customer_id = c.id
                  JOIN time_ranges tr ON o.order_date >= tr.start_current AND o.order_date < tr.tomorrow_start
         WHERE o.project_id = ANY($2)
         GROUP BY c.city
     ),
     previous_period AS (
         SELECT
             c.city,
             SUM(oi.price * oi.number) AS previous_revenue
         FROM order_items oi
                  JOIN orders o ON oi.order_id = o.id
                  JOIN customers c ON o.customer_id = c.id
                  JOIN time_ranges tr ON o.order_date >= tr.start_previous AND o.order_date < tr.end_previous
         WHERE o.project_id = ANY($2)
         GROUP BY c.city
     )
SELECT
    cp.city,
    COALESCE(cp.current_revenue, 0) AS current_revenue,
    COALESCE(pp.previous_revenue, 0) AS previous_revenue
FROM current_period cp
         LEFT JOIN previous_period pp ON cp.city = pp.city
ORDER BY cp.current_revenue DESC
LIMIT 5