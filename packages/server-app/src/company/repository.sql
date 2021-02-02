/*
  @name ensureCompany
  @param employees -> ((id, role, userId, company_id)...)
*/
WITH company_insert as (
  INSERT INTO company (id, name)
  VALUES (:id, :name)
  ON CONFLICT (id)
  DO UPDATE SET name = EXCLUDED.name
  RETURNING *
), employee_insert as (
  INSERT INTO company_employee (id, role, user_id, company_id)
  VALUES :employees
    ON CONFLICT (id)
    DO UPDATE SET role = EXCLUDED.role,
                  user_id = EXCLUDED.user_id,
                  company_id = EXCLUDED.company_id
    RETURNING *
), remove as (
  DELETE FROM company_employee
  WHERE company_id = :id AND id not in (select id from employee_insert)
) select json_build_object(
  'id', id,
  'name', name,
  'employees', (select json_agg(json_build_object(
    'id', id,
    'userId', user_id,
    'role', role
  )) from employee_insert)
)
from company_insert;

/*
  @name whereIds
  @param ids -> (...)
*/
select json_build_object(
  'id', company.id,
  'name', company.name,
  'employees', (
    select json_agg(
      json_build_object(
        'id', company_employee.id,
        'userId', company_employee.user_id,
        'role', company_employee.role
      )
    )
    from company_employee
    where company.id = company_employee.company_id))
from company
where company.id in :ids;


/*
  @name deleteCompanyById
*/
delete from company where id = :id;
