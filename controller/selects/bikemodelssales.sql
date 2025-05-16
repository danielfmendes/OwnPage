WITH time_range AS (
    SELECT
                CURRENT_DATE AS today,
                CASE
                    WHEN $1 = '1d' THEN CURRENT_DATE - INTERVAL '1 day'
                    WHEN $1 = '1w' THEN CURRENT_DATE - INTERVAL '6 days'
                    WHEN $1 = '1m' THEN CURRENT_DATE - INTERVAL '29 days'
                    WHEN $1 = '1y' THEN CURRENT_DATE - INTERVAL '1 year'
                    WHEN $1 = 'max' THEN (
                            SELECT MIN(order_date) FROM orders WHERE project_id = ANY($2)
                    )
                    END AS start_date
),
     date_series AS (
         SELECT
             generate_series(
                     (SELECT start_date FROM time_range),
                     (SELECT today FROM time_range),
                     INTERVAL '1 day'
             )::DATE AS order_date
     ),
     bike_sales AS (
         SELECT
             bm.name AS bike_model,
             o.order_date,
             SUM(oi.number) AS total_sales,
             SUM(oi.price * oi.number) AS revenue
         FROM order_items oi
                  JOIN orders o ON oi.order_id = o.id
                  JOIN bikes b ON oi.bike_id = b.id
                  JOIN bike_models bm ON b.model_id = bm.id
                  JOIN time_range tr ON o.order_date BETWEEN tr.start_date AND tr.today
         WHERE o.project_id = ANY($2)
         GROUP BY bm.name, o.order_date
     ),
     all_combinations AS (
         SELECT
             bm.name AS bike_model,
             ds.order_date
         FROM bike_models bm
                  CROSS JOIN date_series ds
     ),
     final_sales AS (
         SELECT
             ac.bike_model,
             ac.order_date,
             COALESCE(bs.total_sales, 0) AS total_sales,
             COALESCE(bs.revenue, 0) AS revenue
         FROM all_combinations ac
                  LEFT JOIN bike_sales bs
                            ON ac.bike_model = bs.bike_model AND ac.order_date = bs.order_date
     )
SELECT
    bike_model,
    order_date,
    total_sales,
    revenue
FROM final_sales
ORDER BY bike_model, order_date