/*
  @name ensureVacation
*/
insert into vacation (id, start_date, end_date, employee_id, state, answered_by, reason, company_id)
  VALUES (:id, :start_date, :end_date, :employee_id, :state, :answered_by, :reason, :company_id)
  ON CONFLICT (id)
  DO UPDATE SET
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    employee_id = EXCLUDED.employee_id,
    state = EXCLUDED.state,
    answered_by = EXCLUDED.answered_by,
    reason = EXCLUDED.reason,
    company_id = EXCLUDED.company_id
  RETURNING json_build_object(
    'id', id,
    'startDate', start_date,
    'endDate', end_date,
    'employeeId', employee_id,
    'companyId', company_id,
    'request', json_build_object(
      'state', state,
      'answeredBy', answered_by,
      'reason', reason
    ))
;

/*
  @name whereIdVacation
*/
select json_build_object(
    'id', id,
    'startDate', start_date,
    'endDate', end_date,
    'employeeId', employee_id,
    'companyId', company_id,
    'request', json_build_object(
      'state', state,
      'answeredBy', answered_by,
      'reason', reason
    ))
from vacation
where id = :id;


/*
  @name countVacation
*/
select count(*)
from vacation;
