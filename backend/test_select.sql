SELECT wp.id,
       wp.part_type,
       wp.part_id,
       CASE
           WHEN wp.part_type = 'saddle' THEN s.name
           WHEN wp.part_type = 'frame' THEN f.name
           WHEN wp.part_type = 'fork' THEN fk.name
           ELSE NULL
           END AS part_name,
       wp.quantity,
       wp.storage_location
FROM warehouse_parts wp
         LEFT JOIN saddles s ON wp.part_type = 'saddle' AND wp.part_id = s.id
         LEFT JOIN frames f ON wp.part_type = 'frame' AND wp.part_id = f.id
         LEFT JOIN forks fk ON wp.part_type = 'fork' AND wp.part_id = fk.id;

SELECT b.id,
       b.model_id,
       b.serial_number,
       b.production_date,
       b.quantity,
       b.warehouse_location,
       b.project_id,
       bm.name
FROM bikes b
         join public.bike_models bm on b.model_id = bm.id;

SELECT useremail, projectid, role, name
from role_management
         join public.projects p on p.id = role_management.projectid;

SELECT useremail, projectid, role, name
FROM role_management
         JOIN public.projects p ON p.id = role_management.projectid
WHERE role_management.useremail = 'testuser@example.com';

SELECT * FROM (
  SELECT
      o.id AS order_id,
      oi.id AS orderitem_id,
      o.project_id AS project_id,
      CONCAT(c.first_name, ' ', c.name) AS customer_name,
      o.order_date,
      bm.name AS bike_model_name,
      oi.number,
      oi.price
  FROM orders o
           JOIN customers c ON o.customer_id = c.id
           JOIN order_items oi ON oi.order_id = o.id
           JOIN bikes b ON oi.bike_id = b.id
           JOIN bike_models bm ON b.model_id = bm.id
) AS sub;
