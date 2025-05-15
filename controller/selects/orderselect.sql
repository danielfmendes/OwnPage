SELECT *
FROM (SELECT o.id                              AS order_id,
             o.order_date,
             o.project_id,
             o.customer_id,
             CONCAT(c.first_name, ' ', c.name) AS customer_name,
             c.email                           AS customer_email
      FROM orders o
               JOIN customers c ON o.customer_id = c.id) AS sub