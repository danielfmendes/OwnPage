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