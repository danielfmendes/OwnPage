-- ==========================================================
-- ORDERS GENERIEREN (Simulation von Schleifen via CTE)
-- ==========================================================

-- LETZTE WOCHE: 20 Orders
INSERT INTO orders (customer_id, order_date, project_id)
WITH RECURSIVE cnt(i) AS (
    SELECT 1 UNION ALL SELECT i + 1 FROM cnt WHERE i < 20
)
SELECT
    (i % 7) + 1,
    datetime('now', '-7 days', '+' || i || ' hours'),
    1
FROM cnt;

-- LETZTER MONAT: 20 Orders
INSERT INTO orders (customer_id, order_date, project_id)
WITH RECURSIVE cnt(i) AS (
    SELECT 1 UNION ALL SELECT i + 1 FROM cnt WHERE i < 20
)
SELECT
    (i % 7) + 1,
    date('now', '-30 days', '+' || i || ' days'),
    1
FROM cnt;

-- LETZTES JAHR: 20 Orders
INSERT INTO orders (customer_id, order_date, project_id)
WITH RECURSIVE cnt(i) AS (
    SELECT 1 UNION ALL SELECT i + 1 FROM cnt WHERE i < 20
)
SELECT
    (i % 7) + 1,
    date('now', '-365 days', '+' || i || ' days'),
    1
FROM cnt;

-- ==========================================================
-- ORDER ITEMS ANFÜGEN
-- ==========================================================
-- Wir nehmen die letzten 60 Orders und fügen pro Order ein Item hinzu.
-- Da SQLite kein einfaches RANDOM() für Array-Indizes hat, nutzen wir
-- ABS(RANDOM() % 8) + 1 für die Bike-ID.

INSERT INTO order_items (order_id, bike_id, number, price)
SELECT
    id,
    (ABS(RANDOM()) % 8) + 1,               -- Zufällige Bike-ID (1-8)
    (ABS(RANDOM()) % 4) + 1,               -- Zufällige Anzahl (1-4)
    ROUND(800 + (ABS(RANDOM()) % 1000), 2) -- Zufälliger Preis (800-1800)
FROM (SELECT id FROM orders ORDER BY id DESC LIMIT 60);