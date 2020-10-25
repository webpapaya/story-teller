/** Types generated for queries found in "./src/vacation/repository.sql" */
import { PreparedQuery } from '@pgtyped/query'

import { LocalDate } from 'js-joda'

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'ensureVacation' parameters type */
export interface IEnsureVacationParams {
  id: string | null | void
  start_date: LocalDate | null | void
  end_date: LocalDate | null | void
  employee_id: string | null | void
  state: string | null | void
  answered_by: string | null | void
  reason: string | null | void
}

/** 'ensureVacation' return type */
export interface IEnsureVacationResult {
  jsonBuildObject: Json
}

/** 'ensureVacation' query type */
export interface IEnsureVacationQuery {
  params: IEnsureVacationParams
  result: IEnsureVacationResult
}

const ensureVacationIR: any = { 'name': 'ensureVacation', 'params': [{ 'name': 'id', 'transform': { 'type': 'scalar' }, 'codeRefs': { 'used': [{ 'a': 129, 'b': 130, 'line': 5, 'col': 11 }] } }, { 'name': 'start_date', 'transform': { 'type': 'scalar' }, 'codeRefs': { 'used': [{ 'a': 134, 'b': 143, 'line': 5, 'col': 16 }] } }, { 'name': 'end_date', 'transform': { 'type': 'scalar' }, 'codeRefs': { 'used': [{ 'a': 147, 'b': 154, 'line': 5, 'col': 29 }] } }, { 'name': 'employee_id', 'transform': { 'type': 'scalar' }, 'codeRefs': { 'used': [{ 'a': 158, 'b': 168, 'line': 5, 'col': 40 }] } }, { 'name': 'state', 'transform': { 'type': 'scalar' }, 'codeRefs': { 'used': [{ 'a': 172, 'b': 176, 'line': 5, 'col': 54 }] } }, { 'name': 'answered_by', 'transform': { 'type': 'scalar' }, 'codeRefs': { 'used': [{ 'a': 180, 'b': 190, 'line': 5, 'col': 62 }] } }, { 'name': 'reason', 'transform': { 'type': 'scalar' }, 'codeRefs': { 'used': [{ 'a': 194, 'b': 199, 'line': 5, 'col': 76 }] } }], 'usedParamSet': { 'id': true, 'start_date': true, 'end_date': true, 'employee_id': true, 'state': true, 'answered_by': true, 'reason': true }, 'statement': { 'body': "insert into vacation (id, start_date, end_date, employee_id, state, answered_by, reason)\n  VALUES (:id, :start_date, :end_date, :employee_id, :state, :answered_by, :reason)\n  ON CONFLICT (id)\n  DO UPDATE SET\n    start_date = EXCLUDED.start_date,\n    end_date = EXCLUDED.end_date,\n    employee_id = EXCLUDED.employee_id,\n    state = EXCLUDED.state,\n    answered_by = EXCLUDED.answered_by,\n    reason = EXCLUDED.reason\n  RETURNING json_build_object(\n    'id', id,\n    'startDate', start_date,\n    'endDate', end_date,\n    'employeeId', employee_id,\n    'request', json_build_object(\n      'state', state,\n      'answeredBy', answered_by,\n      'reason', reason\n    ))", 'loc': { 'a': 29, 'b': 693, 'line': 4, 'col': 0 } } }

/**
 * Query generated from SQL:
 * ```
 * insert into vacation (id, start_date, end_date, employee_id, state, answered_by, reason)
 *   VALUES (:id, :start_date, :end_date, :employee_id, :state, :answered_by, :reason)
 *   ON CONFLICT (id)
 *   DO UPDATE SET
 *     start_date = EXCLUDED.start_date,
 *     end_date = EXCLUDED.end_date,
 *     employee_id = EXCLUDED.employee_id,
 *     state = EXCLUDED.state,
 *     answered_by = EXCLUDED.answered_by,
 *     reason = EXCLUDED.reason
 *   RETURNING json_build_object(
 *     'id', id,
 *     'startDate', start_date,
 *     'endDate', end_date,
 *     'employeeId', employee_id,
 *     'request', json_build_object(
 *       'state', state,
 *       'answeredBy', answered_by,
 *       'reason', reason
 *     ))
 * ```
 */
export const ensureVacation = new PreparedQuery<IEnsureVacationParams, IEnsureVacationResult>(ensureVacationIR)

/** 'whereIdVacation' parameters type */
export interface IWhereIdVacationParams {
  id: string | null | void
}

/** 'whereIdVacation' return type */
export interface IWhereIdVacationResult {
  jsonBuildObject: Json
}

/** 'whereIdVacation' query type */
export interface IWhereIdVacationQuery {
  params: IWhereIdVacationParams
  result: IWhereIdVacationResult
}

const whereIdVacationIR: any = { 'name': 'whereIdVacation', 'params': [{ 'name': 'id', 'transform': { 'type': 'scalar' }, 'codeRefs': { 'used': [{ 'a': 998, 'b': 999, 'line': 40, 'col': 12 }] } }], 'usedParamSet': { 'id': true }, 'statement': { 'body': "select json_build_object(\n    'id', id,\n    'startDate', start_date,\n    'endDate', end_date,\n    'employeeId', employee_id,\n    'request', json_build_object(\n      'state', state,\n      'answeredBy', answered_by,\n      'reason', reason\n    ))\nfrom vacation\nwhere id = :id", 'loc': { 'a': 728, 'b': 999, 'line': 29, 'col': 0 } } }

/**
 * Query generated from SQL:
 * ```
 * select json_build_object(
 *     'id', id,
 *     'startDate', start_date,
 *     'endDate', end_date,
 *     'employeeId', employee_id,
 *     'request', json_build_object(
 *       'state', state,
 *       'answeredBy', answered_by,
 *       'reason', reason
 *     ))
 * from vacation
 * where id = :id
 * ```
 */
export const whereIdVacation = new PreparedQuery<IWhereIdVacationParams, IWhereIdVacationResult>(whereIdVacationIR)

/** 'countVacation' parameters type */
export type ICountVacationParams = void;

/** 'countVacation' return type */
export interface ICountVacationResult {
  count: number
}

/** 'countVacation' query type */
export interface ICountVacationQuery {
  params: ICountVacationParams
  result: ICountVacationResult
}

const countVacationIR: any = { 'name': 'countVacation', 'params': [], 'usedParamSet': {}, 'statement': { 'body': 'select count(*)\nfrom vacation', 'loc': { 'a': 1032, 'b': 1060, 'line': 46, 'col': 0 } } }

/**
 * Query generated from SQL:
 * ```
 * select count(*)
 * from vacation
 * ```
 */
export const countVacation = new PreparedQuery<ICountVacationParams, ICountVacationResult>(countVacationIR)
