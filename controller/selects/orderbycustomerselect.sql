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
WHERE o.project_id = ANY ($2) AND c.email = $1