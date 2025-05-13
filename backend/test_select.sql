SELECT useremail, projectid, role, name
from role_management
         join public.projects p on p.id = role_management.projectid;

SELECT useremail, projectid, role, name
FROM role_management
         JOIN public.projects p ON p.id = role_management.projectid
WHERE role_management.useremail = 'testuser@example.com';