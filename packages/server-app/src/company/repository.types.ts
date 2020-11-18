/** Types generated for queries found in "./src/company/repository.sql" */
import { PreparedQuery } from '@pgtyped/query'

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json }

/** 'ensureCompany' parameters type */
export interface IEnsureCompanyParams {
  employees: Array<{
    id: string
    role: string
    userId: string
    company_id: string
  }>
  id: string | null | void
  name: string | null | void
}

/** 'ensureCompany' return type */
export interface IEnsureCompanyResult {
  jsonBuildObject: Json
}

/** 'ensureCompany' query type */
export interface IEnsureCompanyQuery {
  params: IEnsureCompanyParams
  result: IEnsureCompanyResult
}

const ensureCompanyIR: any = { name: 'ensureCompany', params: [{ name: 'employees', codeRefs: { defined: { a: 34, b: 42, line: 3, col: 9 }, used: [{ a: 333, b: 341, line: 13, col: 10 }] }, transform: { type: 'pick_array_spread', keys: ['id', 'role', 'userId', 'company_id'] } }, { name: 'id', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 155, b: 156, line: 7, col: 11 }, { a: 585, b: 586, line: 21, col: 22 }] } }, { name: 'name', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 160, b: 163, line: 7, col: 16 }] } }], usedParamSet: { id: true, name: true, employees: true }, statement: { body: "WITH company_insert as (\n  INSERT INTO company (id, name)\n  VALUES (:id, :name)\n  ON CONFLICT (id)\n  DO UPDATE SET name = EXCLUDED.name\n  RETURNING *\n), employee_insert as (\n  INSERT INTO company_employee (id, role, user_id, company_id)\n  VALUES :employees\n    ON CONFLICT (id)\n    DO UPDATE SET role = EXCLUDED.role,\n                  user_id = EXCLUDED.user_id,\n                  company_id = EXCLUDED.company_id\n    RETURNING *\n), remove as (\n  DELETE FROM company_employee\n  WHERE company_id = :id AND id not in (select id from employee_insert)\n) select json_build_object(\n  'id', id,\n  'name', name,\n  'employees', (select json_agg(json_build_object(\n    'id', id,\n    'userId', user_id,\n    'role', role\n  )) from employee_insert)\n)\nfrom company_insert", loc: { a: 86, b: 843, line: 5, col: 0 } } }

/**
 * Query generated from SQL:
 * ```
 * WITH company_insert as (
 *   INSERT INTO company (id, name)
 *   VALUES (:id, :name)
 *   ON CONFLICT (id)
 *   DO UPDATE SET name = EXCLUDED.name
 *   RETURNING *
 * ), employee_insert as (
 *   INSERT INTO company_employee (id, role, user_id, company_id)
 *   VALUES :employees
 *     ON CONFLICT (id)
 *     DO UPDATE SET role = EXCLUDED.role,
 *                   user_id = EXCLUDED.user_id,
 *                   company_id = EXCLUDED.company_id
 *     RETURNING *
 * ), remove as (
 *   DELETE FROM company_employee
 *   WHERE company_id = :id AND id not in (select id from employee_insert)
 * ) select json_build_object(
 *   'id', id,
 *   'name', name,
 *   'employees', (select json_agg(json_build_object(
 *     'id', id,
 *     'userId', user_id,
 *     'role', role
 *   )) from employee_insert)
 * )
 * from company_insert
 * ```
 */
export const ensureCompany = new PreparedQuery<IEnsureCompanyParams, IEnsureCompanyResult>(ensureCompanyIR)

/** 'whereId' parameters type */
export interface IWhereIdParams {
  id: string | null | void
}

/** 'whereId' return type */
export interface IWhereIdResult {
  jsonBuildObject: Json
}

/** 'whereId' query type */
export interface IWhereIdQuery {
  params: IWhereIdParams
  result: IWhereIdResult
}

const whereIdIR: any = { name: 'whereId', params: [{ name: 'id', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 1183, b: 1184, line: 48, col: 24 }, { a: 1221, b: 1222, line: 50, col: 20 }] } }], usedParamSet: { id: true }, statement: { body: "select json_build_object(\n  'id', company.id,\n  'name', company.name,\n  'employees', (\n    select json_agg(\n      json_build_object(\n        'id', company_employee.id,\n        'userId', company_employee.user_id,\n        'role', company_employee.role\n      )\n    )\n    from company_employee\n    where company_id = :id))\nfrom company\nwhere company.id = :id", loc: { a: 869, b: 1222, line: 36, col: 0 } } }

/**
 * Query generated from SQL:
 * ```
 * select json_build_object(
 *   'id', company.id,
 *   'name', company.name,
 *   'employees', (
 *     select json_agg(
 *       json_build_object(
 *         'id', company_employee.id,
 *         'userId', company_employee.user_id,
 *         'role', company_employee.role
 *       )
 *     )
 *     from company_employee
 *     where company_id = :id))
 * from company
 * where company.id = :id
 * ```
 */
export const whereId = new PreparedQuery<IWhereIdParams, IWhereIdResult>(whereIdIR)

/** 'deleteCompanyById' parameters type */
export interface IDeleteCompanyByIdParams {
  id: string | null | void
}

/** 'deleteCompanyById' return type */
export type IDeleteCompanyByIdResult = void

/** 'deleteCompanyById' query type */
export interface IDeleteCompanyByIdQuery {
  params: IDeleteCompanyByIdParams
  result: IDeleteCompanyByIdResult
}

const deleteCompanyByIdIR: any = { name: 'deleteCompanyById', params: [{ name: 'id', transform: { type: 'scalar' }, codeRefs: { used: [{ a: 1291, b: 1292, line: 56, col: 32 }] } }], usedParamSet: { id: true }, statement: { body: 'delete from company where id = :id', loc: { a: 1259, b: 1292, line: 56, col: 0 } } }

/**
 * Query generated from SQL:
 * ```
 * delete from company where id = :id
 * ```
 */
export const deleteCompanyById = new PreparedQuery<IDeleteCompanyByIdParams, IDeleteCompanyByIdResult>(deleteCompanyByIdIR)
