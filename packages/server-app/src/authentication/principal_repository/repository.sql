/* @name wherePrincipal */

SELECT json_build_object(
  'id', user_authentication.id,
  'employedIn', (
    select json_agg(
      json_build_object(
        'companyId', company_employee.company_id,
        'role', company_employee.role
      )
    )
    from company_employee
    where user_id = :id))
FROM user_authentication
WHERE id = :id;

