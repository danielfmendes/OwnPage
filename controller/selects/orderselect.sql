SELECT *
FROM (SELECT o.id                              AS order_id,
             oi.id                             AS orderitem_id,
             o.project_id                      AS project_id,
             CONCAT(c.first_name, ' ', c.name) AS customer_name,
             o.order_date,
             bm.name                           AS bike_model_name,
             oi.number,
             oi.price
      FROM orders o
               JOIN customers c ON o.customer_id = c.id
               JOIN order_items oi ON oi.order_id = o.id
               JOIN bikes b ON oi.bike_id = b.id
               JOIN bike_models bm ON b.model_id = bm.id) AS sub