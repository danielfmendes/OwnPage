CREATE VIEW revenue_per_month AS
SELECT strftime('%Y-%m-01', order_date) AS month,
       SUM(price)                       AS total_revenue
FROM order_items
         JOIN orders ON order_items.order_id = orders.id
GROUP BY month;


CREATE VIEW sold_parts AS
SELECT bm.saddle_id,
       bm.frame_id,
       bm.fork_id,
       COUNT(*) AS times_used
FROM order_items oi
         JOIN bikes b ON oi.bike_id = b.id
         JOIN bike_models bm ON b.model_id = bm.id
GROUP BY bm.saddle_id, bm.frame_id, bm.fork_id;