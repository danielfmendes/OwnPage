-- LAST WEEK: 20 Orders per project
DO $$
BEGIN
    FOR i IN 1..20 LOOP
        INSERT INTO orders (customer_id, order_date, project_id)
        VALUES ((i % 4) + 1, NOW() - INTERVAL '7 days' + ((i * 8) || ' hours')::interval, 1);
        
        INSERT INTO orders (customer_id, order_date, project_id)
        VALUES ((i % 3) + 5, NOW() - INTERVAL '7 days' + ((i * 8) || ' hours')::interval, 2);
    END LOOP;
END $$;

-- LAST MONTH: 20 Orders per project
DO $$
BEGIN
    FOR i IN 1..20 LOOP
        INSERT INTO orders (customer_id, order_date, project_id)
        VALUES ((i % 4) + 1, NOW() - INTERVAL '30 days' + ((i * 36) || ' hours')::interval, 1);
        
        INSERT INTO orders (customer_id, order_date, project_id)
        VALUES ((i % 3) + 5, NOW() - INTERVAL '30 days' + ((i * 36) || ' hours')::interval, 2);
    END LOOP;
END $$;

-- LAST YEAR: 20 Orders per project
DO $$
BEGIN
    FOR i IN 1..20 LOOP
        INSERT INTO orders (customer_id, order_date, project_id)
        VALUES ((i % 4) + 1, NOW() - INTERVAL '365 days' + ((i * 438) || ' hours')::interval, 1);
        
        INSERT INTO orders (customer_id, order_date, project_id)
        VALUES ((i % 3) + 5, NOW() - INTERVAL '365 days' + ((i * 438) || ' hours')::interval, 2);
    END LOOP;
END $$;

-- =======================
-- ADD ORDER ITEMS
-- =======================
-- Generate 1-3 items for all 120 generated orders
DO $$
DECLARE
    order_row RECORD;
    bike_ids_p1 INTEGER[] := ARRAY[1, 2, 3, 4];
    bike_ids_p2 INTEGER[] := ARRAY[5, 6, 7, 8];
BEGIN
    FOR order_row IN SELECT id, project_id FROM orders ORDER BY id DESC LIMIT 120
    LOOP
        IF order_row.project_id = 1 THEN
            INSERT INTO order_items (order_id, bike_id, number, price)
            VALUES (order_row.id, bike_ids_p1[((random() * 3) + 1)::int], ((random() * 3) + 1)::int, round(((random() * 1000) + 800)::numeric, 2));
        ELSE
            INSERT INTO order_items (order_id, bike_id, number, price)
            VALUES (order_row.id, bike_ids_p2[((random() * 3) + 1)::int], ((random() * 3) + 1)::int, round(((random() * 1200) + 1000)::numeric, 2));
        END IF;
    END LOOP;
END $$;
