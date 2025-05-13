WITH time_ranges AS (
    SELECT
                CURRENT_DATE AS today,
                CASE WHEN $1 = '1d' THEN CURRENT_DATE - INTERVAL '1 day'
                     WHEN $1 = '1w' THEN CURRENT_DATE - INTERVAL '1 week'
                     WHEN $1 = '1m' THEN CURRENT_DATE - INTERVAL '1 month'
                     WHEN $1 = '1y' THEN CURRENT_DATE - INTERVAL '1 year'
                     WHEN $1 = 'max' THEN DATE '2020-01-01'
                    END AS start_current,
                CASE WHEN $1 = '1d' THEN CURRENT_DATE - INTERVAL '2 day'
                     WHEN $1 = '1w' THEN CURRENT_DATE - INTERVAL '2 week'
                     WHEN $1 = '1m' THEN CURRENT_DATE - INTERVAL '2 month'
                     WHEN $1 = '1y' THEN CURRENT_DATE - INTERVAL '2 year'
                     WHEN $1 = 'max' THEN DATE '2020-01-01'
                    END AS start_previous,
                CASE WHEN $1 = '1d' THEN CURRENT_DATE - INTERVAL '1 day'
                     WHEN $1 = '1w' THEN CURRENT_DATE - INTERVAL '1 week'
                     WHEN $1 = '1m' THEN CURRENT_DATE - INTERVAL '1 month'
                     WHEN $1 = '1y' THEN CURRENT_DATE - INTERVAL '1 year'
                     WHEN $1 = 'max' THEN DATE '2020-01-01'
                    END AS end_previous
),
     current_period AS (
         SELECT
             c.city,
             SUM(oi.price * oi.number) AS current_revenue
         FROM order_items oi
                  JOIN orders o ON oi.order_id = o.id
                  JOIN customers c ON o.customer_id = c.id
                  JOIN time_ranges tr ON o.order_date >= tr.start_current AND o.order_date < tr.today
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