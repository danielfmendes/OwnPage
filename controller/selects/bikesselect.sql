SELECT b.id,
       b.model_id,
       b.serial_number,
       b.production_date,
       b.quantity,
       b.warehouse_location,
       b.project_id,
       bm.name
FROM bikes b
         join public.bike_models bm on b.model_id = bm.id