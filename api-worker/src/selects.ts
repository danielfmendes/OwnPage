export const bikeModelsSalesSQL = `
    WITH RECURSIVE time_range AS (
        SELECT
        date('now') AS today,
        CASE
        WHEN ?1 = '1d' THEN date('now', '-1 day')
        WHEN ?1 = '1w' THEN date('now', '-6 days')
        WHEN ?1 = '1m' THEN date('now', '-29 days')
        WHEN ?1 = '1y' THEN date('now', '-1 year')
        WHEN ?1 = 'max' THEN (SELECT MIN(order_date) FROM orders WHERE project_id = ?2)
        ELSE date('now', '-29 days')
    END AS start_date
),
date_series(order_date) AS (
    SELECT start_date FROM time_range
    UNION ALL
    SELECT date(order_date, '+1 day')
    FROM date_series
    WHERE order_date < (SELECT today FROM time_range)
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
    WHERE o.project_id = ?2
    GROUP BY bm.name, o.order_date
),
all_combinations AS (
    SELECT bm.name AS bike_model, ds.order_date
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
    LEFT JOIN bike_sales bs ON ac.bike_model = bs.bike_model AND ac.order_date = bs.order_date
)
    SELECT bike_model, order_date, total_sales, revenue
    FROM final_sales
    ORDER BY order_date ASC, bike_model;
`;

export const bikesSelectSQL = `
    SELECT b.id,
           b.model_id,
           b.serial_number,
           b.production_date,
           b.quantity,
           b.warehouse_location,
           b.project_id,
           bm.name as model_name
    FROM bikes b
             JOIN bike_models bm ON b.model_id = bm.id;
`;

export const cityDataSQL = `
    WITH RECURSIVE time_ranges AS (
        SELECT
        date('now') AS today,
        date('now', '+1 day') AS tomorrow,
        CASE ?1
        WHEN '1d' THEN date('now', '-1 day')
        WHEN '1w' THEN date('now', '-6 days')
        WHEN '1m' THEN date('now', '-29 days')
        WHEN '1y' THEN date('now', '-364 days')
        ELSE (SELECT MIN(order_date) FROM orders WHERE project_id = ?2)
    END AS start_current,
        CASE ?1
            WHEN '1d' THEN date('now', '-2 days')
            WHEN '1w' THEN date('now', '-13 days')
            WHEN '1m' THEN date('now', '-59 days')
            WHEN '1y' THEN date('now', '-729 days')
            ELSE (SELECT MIN(order_date) FROM orders WHERE project_id = ?2)
    END AS start_previous,
        CASE ?1
            WHEN '1d' THEN date('now', '-1 day')
            WHEN '1w' THEN date('now', '-7 days')
            WHEN '1m' THEN date('now', '-30 days')
            WHEN '1y' THEN date('now', '-365 days')
            ELSE (SELECT MIN(order_date) FROM orders WHERE project_id = ?2)
    END AS end_previous
),
current_period AS (
    SELECT c.city, SUM(oi.price * oi.number) AS current_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN customers c ON o.customer_id = c.id
    JOIN time_ranges tr ON o.order_date >= tr.start_current AND o.order_date < tr.tomorrow
    WHERE o.project_id = ?2
    GROUP BY c.city
),
previous_period AS (
    SELECT c.city, SUM(oi.price * oi.number) AS previous_revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN customers c ON o.customer_id = c.id
    JOIN time_ranges tr ON o.order_date >= tr.start_previous AND o.order_date < tr.end_previous
    WHERE o.project_id = ?2
    GROUP BY c.city
)
    SELECT
        cp.city,
        COALESCE(cp.current_revenue, 0) AS current_revenue,
        COALESCE(pp.previous_revenue, 0) AS previous_revenue
    FROM current_period cp
             LEFT JOIN previous_period pp ON cp.city = pp.city;
`;

export const graphDataSQL = `
    WITH RECURSIVE time_range AS (
        SELECT
        date('now') AS today,
        CASE
        WHEN ?1 = '1d' THEN date('now', '-1 day')
        WHEN ?1 = '1w' THEN date('now', '-6 days')
        WHEN ?1 = '1m' THEN date('now', '-29 days')
        WHEN ?1 = '1y' THEN date('now', '-1 year')
        WHEN ?1 = 'max' THEN (SELECT MIN(order_date) FROM orders WHERE project_id = ?2)
        ELSE date('now', '-29 days')
    END AS start_date
),
date_series(order_date) AS (
    SELECT start_date FROM time_range
    UNION ALL
    SELECT date(order_date, '+1 day')
    FROM date_series
    WHERE order_date < (SELECT today FROM time_range)
),
bike_sales AS (
    SELECT 
        o.order_date,
        SUM(oi.number) AS total_sales,
        SUM(oi.price * oi.number) AS revenue
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN time_range tr ON o.order_date BETWEEN tr.start_date AND tr.today
    WHERE o.project_id = ?2
    GROUP BY o.order_date
)
    SELECT
        ds.order_date AS bucket,
        COALESCE(bs.revenue, 0) AS revenue,
        COALESCE(bs.total_sales, 0) AS sales_no
    FROM date_series ds
             LEFT JOIN bike_sales bs ON ds.order_date = bs.order_date
    ORDER BY ds.order_date ASC;
`;

export const graphMetaSQL = `
    WITH time_ranges AS (
        SELECT
        date('now', '+1 day') AS tomorrow,
        CASE ?1
        WHEN '1d' THEN date('now', '-1 day')
        WHEN '1w' THEN date('now', '-6 days')
        WHEN '1m' THEN date('now', '-29 days')
        WHEN '1y' THEN date('now', '-364 days')
        ELSE (SELECT COALESCE(MIN(order_date), date('now')) FROM orders WHERE project_id = ?2)
    END AS start_current,
        CASE ?1
            WHEN '1d' THEN date('now', '-2 days')
            WHEN '1w' THEN date('now', '-13 days')
            WHEN '1m' THEN date('now', '-59 days')
            WHEN '1y' THEN date('now', '-729 days')
            ELSE (SELECT COALESCE(MIN(order_date), date('now')) FROM orders WHERE project_id = ?2)
    END AS start_previous,
        CASE ?1
            WHEN '1d' THEN date('now', '-1 day')
            WHEN '1w' THEN date('now', '-7 days')
            WHEN '1m' THEN date('now', '-30 days')
            WHEN '1y' THEN date('now', '-365 days')
            ELSE (SELECT COALESCE(MIN(order_date), date('now')) FROM orders WHERE project_id = ?2)
    END AS end_previous
),
current_period AS (
    SELECT 
        SUM(oi.price * oi.number) AS revenue,
        SUM(oi.number) AS sales_no
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN time_ranges tr ON o.order_date >= tr.start_current AND o.order_date < tr.tomorrow
    WHERE o.project_id = ?2
),
previous_period AS (
    SELECT 
        SUM(oi.price * oi.number) AS revenue,
        SUM(oi.number) AS sales_no
    FROM order_items oi
    JOIN orders o ON oi.order_id = o.id
    JOIN time_ranges tr ON o.order_date >= tr.start_previous AND o.order_date < tr.end_previous
    WHERE o.project_id = ?2
)
    SELECT
        COALESCE(cp.revenue, 0) AS current_revenue,
        COALESCE(pp.revenue, 0) AS previous_revenue,
        COALESCE(cp.sales_no, 0) AS current_sales_no,
        COALESCE(pp.sales_no, 0) AS previous_sales_no
    FROM current_period cp, previous_period pp;
`;

export const orderByCustomerSelectSQL = `
    SELECT oi.id       AS id,
           oi.order_id AS order_id,
           oi.bike_id,
           oi.number,
           oi.price,
           bm.name     AS model_name,
           o.order_date
    FROM orders o
             JOIN customers c ON o.customer_id = c.id
             JOIN order_items oi ON oi.order_id = o.id
             JOIN bikes b ON oi.bike_id = b.id
             JOIN bike_models bm ON b.model_id = bm.id
    WHERE o.project_id = ?2 AND c.email = ?1;
`;

export const orderItemSelectSQL = `
    SELECT oi.id,
           oi.order_id,
           b.id as bike_id,
           bm.name AS model_name,
           oi.number,
           oi.price
    FROM order_items oi
             JOIN bikes b ON oi.bike_id = b.id
             JOIN bike_models bm ON b.model_id = bm.id
    WHERE oi.order_id = ?1;
`;

export const orderSelectSQL = `
    SELECT o.id AS order_id,
           o.order_date,
           o.project_id,
           o.customer_id,
           (c.first_name || ' ' || c.name) AS customer_name,
           c.email AS customer_email
    FROM orders o
             JOIN customers c ON o.customer_id = c.id;
`;

export const warehousePartsSelectSQL = `
    SELECT
        wp.id, wp.part_type, wp.part_id,
        CASE
            WHEN wp.part_type = 'saddle' THEN s.name
            WHEN wp.part_type = 'frame' THEN f.name
            WHEN wp.part_type = 'fork' THEN fk.name
            ELSE NULL
            END AS part_name,
        wp.quantity, wp.storage_location, wp.project_id
    FROM warehouse_parts wp
             LEFT JOIN saddles s ON wp.part_type = 'saddle' AND wp.part_id = s.id
             LEFT JOIN frames f ON wp.part_type = 'frame' AND wp.part_id = f.id
             LEFT JOIN forks fk ON wp.part_type = 'fork' AND wp.part_id = fk.id;
`;