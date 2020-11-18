/* @name wherePrincipal */

SELECT json_build_object(
  'id', user_authentication.id,
  'employedIn', (
    select json_agg(
      json_build_object(
        'company_id', company_employee.id,
        'role', company_employee.role
      )
    )
    from company_employee
    where user_id = :id))
FROM user_authentication
WHERE id = :id;

