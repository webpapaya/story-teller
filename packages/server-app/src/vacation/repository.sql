/*
  @name ensureVacation
*/
insert into vacation (id, start_date, end_date, person_id, state, confirmed_by, reason)
  VALUES (:id, :start_date, :end_date, :person_id, :state, :confirmed_by, :reason)
  ON CONFLICT (id)
  DO UPDATE SET
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    person_id = EXCLUDED.person_id,
    state = EXCLUDED.state,
    confirmed_by = EXCLUDED.confirmed_by,
    reason = EXCLUDED.reason
  RETURNING json_build_object(
    'id', id,
    'startDate', start_date,
    'endDate', end_date,
    'personId', person_id,
    'request', json_build_object(
      'state', state,
      'confirmedBy', confirmed_by,
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
    'personId', person_id,
    'request', json_build_object(
      'state', state,
      'confirmedBy', confirmed_by,
      'reason', reason
  ))
from vacation
where id = :id;


/*
  @name countVacation
*/
select count(*)
from vacation;
