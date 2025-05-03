INSERT INTO role_management (useremail, projectid, role)
VALUES
    ('testuser@email.com', 1, 'admin');

UPDATE role_management
SET role = 'user' WHERE useremail = 'testuser@email.com';

UPDATE role_management
SET role = 'admin' WHERE useremail = 'testuser@email.com';

SELECT * from users;