/** Types generated for queries found in "./src/company/repository.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'ensureCompany' parameters type */
export interface IEnsureCompanyParams {
  employees: Array<{
    id: string,
    role: string,
    company_id: string
  }>;
  id: string | null | void;
  name: string | null | void;
}

/** 'ensureCompany' return type */
export interface IEnsureCompanyResult {
  jsonBuildObject: Json;
}

/** 'ensureCompany' query type */
export interface IEnsureCompanyQuery {
  params: IEnsureCompanyParams;
  result: IEnsureCompanyResult;
}

const ensureCompanyIR: any = {"name":"ensureCompany","params":[{"name":"employees","codeRefs":{"defined":{"a":34,"b":42,"line":3,"col":9},"used":[{"a":316,"b":324,"line":13,"col":10}]},"transform":{"type":"pick_array_spread","keys":["id","role","company_id"]}},{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":147,"b":148,"line":7,"col":11},{"a":522,"b":523,"line":20,"col":22}]}},{"name":"name","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":152,"b":155,"line":7,"col":16}]}}],"usedParamSet":{"id":true,"name":true,"employees":true},"statement":{"body":"WITH company_insert as (\n  INSERT INTO company (id, name)\n  VALUES (:id, :name)\n  ON CONFLICT (id)\n  DO UPDATE SET name = EXCLUDED.name\n  RETURNING *\n), employee_insert as (\n  INSERT INTO company_employee (id, role, company_id)\n  VALUES :employees\n    ON CONFLICT (id)\n    DO UPDATE SET role = EXCLUDED.role,\n                  company_id = EXCLUDED.company_id\n    RETURNING *\n), remove as (\n  DELETE FROM company_employee\n  WHERE company_id = :id AND id not in (select id from employee_insert)\n) select json_build_object(\n  'id', id,\n  'name', name,\n  'employees', (select json_agg(json_build_object('id', id, 'role', role)) from employee_insert)\n)\nfrom company_insert","loc":{"a":78,"b":745,"line":5,"col":0}}};

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
 *   INSERT INTO company_employee (id, role, company_id)
 *   VALUES :employees
 *     ON CONFLICT (id)
 *     DO UPDATE SET role = EXCLUDED.role,
 *                   company_id = EXCLUDED.company_id
 *     RETURNING *
 * ), remove as (
 *   DELETE FROM company_employee
 *   WHERE company_id = :id AND id not in (select id from employee_insert)
 * ) select json_build_object(
 *   'id', id,
 *   'name', name,
 *   'employees', (select json_agg(json_build_object('id', id, 'role', role)) from employee_insert)
 * )
 * from company_insert
 * ```
 */
export const ensureCompany = new PreparedQuery<IEnsureCompanyParams,IEnsureCompanyResult>(ensureCompanyIR);


