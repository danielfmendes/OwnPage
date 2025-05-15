-- LETZTE WOCHE: 20 Orders
DO $$
BEGIN
    FOR i IN 1..20 LOOP
INSERT INTO orders (customer_id, order_date, project_id)
VALUES ((i % 7) + 1, NOW() - INTERVAL '7 days' + (i || ' hours')::interval, 1);
END LOOP;
END $$;

-- LETZTER MONAT: 20 Orders
DO $$
BEGIN
    FOR i IN 1..20 LOOP
INSERT INTO orders (customer_id, order_date, project_id)
VALUES ((i % 7) + 1, NOW() - INTERVAL '30 days' + (i || ' days')::interval, 1);
END LOOP;
END $$;

-- LETZTES JAHR: 20 Orders
DO $$
BEGIN
    FOR i IN 1..20 LOOP
INSERT INTO orders (customer_id, order_date, project_id)
VALUES ((i % 7) + 1, NOW() - INTERVAL '365 days' + (i || ' days')::interval, 1);
END LOOP;
END $$;

-- =======================
-- ORDER ITEMS anfügen
-- =======================
-- Annahme: Neu erzeugte order_ids sind die letzten 60
-- Generiere zu jeder Order 1–3 Items
DO $$
    DECLARE
  order_row RECORD;
bike_ids INTEGER[] := ARRAY[1, 2, 3, 4, 5, 6, 7, 8];
BEGIN
    FOR order_row IN
SELECT id FROM orders ORDER BY id DESC LIMIT 60
LOOP
INSERT INTO order_items (order_id, bike_id, number, price)
VALUES
    (order_row.id, bike_ids[(random() * 7 + 1)::int], (random() * 4 + 1)::int, round((random() * 1000 + 800)::numeric, 2));
END LOOP;
END $$;
