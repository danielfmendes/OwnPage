SELECT useremail, project_id, role, name
from role_management
         join public.projects p on p.id = role_management.project_id;

SELECT useremail, project_id, role, name
FROM role_management
         JOIN public.projects p ON p.id = role_management.project_id
WHERE role_management.useremail = 'testuser@example.com';