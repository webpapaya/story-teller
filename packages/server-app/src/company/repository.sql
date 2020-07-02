/*
  @name ensureCompany
  @param employees -> ((id, role, company_id)...)
*/
WITH company_insert as (
  INSERT INTO company (id, name)
  VALUES (:id, :name)
  ON CONFLICT (id)
  DO UPDATE SET name = EXCLUDED.name
  RETURNING *
), employee_insert as (
  INSERT INTO company_employee (id, role, company_id)
  VALUES :employees
    ON CONFLICT (id)
    DO UPDATE SET role = EXCLUDED.role,
                  company_id = EXCLUDED.company_id
    RETURNING *
), remove as (
  DELETE FROM company_employee
  WHERE company_id = :id AND id not in (select id from employee_insert)
) select json_build_object(
  'id', id,
  'name', name,
  'employees', (select json_agg(json_build_object('id', id, 'role', role)) from employee_insert)
)
from company_insert;

