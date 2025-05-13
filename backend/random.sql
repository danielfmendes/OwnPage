INSERT INTO role_management (useremail, project_id, role)
VALUES ('testuser@email.com', 1, 'admin');

UPDATE role_management
SET role = 'user'
WHERE useremail = 'testuser@email.com';

UPDATE role_management
SET role = 'admin'
WHERE useremail = 'testuser@email.com';

SELECT * FROM users;

--Reihenfolge des Löschens
SELECT project_id FROM orders WHERE id = 1;
SELECT orders.project_id FROM orders JOIN order_items ON orders.id = order_items.order_id WHERE order_items.bike_id = 1;
DELETE FROM order_items WHERE bike_id = 2;
DELETE FROM orders WHERE id NOT IN (SELECT DISTINCT order_id FROM order_items);
DELETE FROM bikes where id = 2;

-- Kontrollieren, ob Löschen erfolgreich war
SELECT * FROM bikes;
SELECT * FROM order_items;
SELECT * FROM orders;

-- Neue Projekte hinzufügen für testuser
INSERT INTO projects (name)
VALUES ('Standardprojekt 2');
INSERT INTO projects (name)
VALUES ('Standardprojekt 3');
INSERT INTO projects (name)
VALUES ('Standardprojekt 4');

INSERT INTO role_management (useremail, project_id, role)
VALUES
    ('testuser@example.com', 2, 'user'),
    ('testuser@example.com', 3, 'user'),
    ('testuser@example.com', 4, 'admin');

-- Reihenfolge des Löschens von Benutzern
DELETE FROM order_items
WHERE order_id IN (
    SELECT id FROM orders WHERE customer_id = 1
);
DELETE FROM orders WHERE customer_id = 1;
DELETE FROM customers WHERE id = 1;

-- 2. Befehl löscht alle orders, die jetzt keine order_items mehr haben
DELETE from order_items WHERE id = 2;
DELETE FROM orders
WHERE id NOT IN (
    SELECT DISTINCT order_id FROM order_items
);
