INSERT INTO role_management (useremail, projectid, role)
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