SELECT *
FROM (SELECT oi.id,
             oi.order_id,
             b.id,
             bm.name AS model_name,
             oi.number,
             oi.price
      FROM order_items oi
               JOIN bikes b ON oi.bike_id = b.id
               JOIN bike_models bm ON b.model_id = bm.id
      WHERE order_id = $1) AS sub