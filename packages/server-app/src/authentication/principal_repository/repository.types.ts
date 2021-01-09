/** Types generated for queries found in "./src/authentication/principal_repository/repository.sql" */
import { PreparedQuery } from '@pgtyped/query';

export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

/** 'wherePrincipal' parameters type */
export interface IWherePrincipalParams {
  id: string | null | void;
}

/** 'wherePrincipal' return type */
export interface IWherePrincipalResult {
  jsonBuildObject: Json;
}

/** 'wherePrincipal' query type */
export interface IWherePrincipalQuery {
  params: IWherePrincipalParams;
  result: IWherePrincipalResult;
}

const wherePrincipalIR: any = {"name":"wherePrincipal","params":[{"name":"id","transform":{"type":"scalar"},"codeRefs":{"used":[{"a":299,"b":300,"line":13,"col":21},{"a":341,"b":342,"line":15,"col":12}]}}],"usedParamSet":{"id":true},"statement":{"body":"SELECT json_build_object(\n  'id', user_authentication.id,\n  'employedIn', (\n    select json_agg(\n      json_build_object(\n        'companyId', company_employee.company_id,\n        'role', company_employee.role\n      )\n    )\n    from company_employee\n    where user_id = :id))\nFROM user_authentication\nWHERE id = :id","loc":{"a":28,"b":342,"line":3,"col":0}}};

/**
 * Query generated from SQL:
 * ```
 * SELECT json_build_object(
 *   'id', user_authentication.id,
 *   'employedIn', (
 *     select json_agg(
 *       json_build_object(
 *         'companyId', company_employee.company_id,
 *         'role', company_employee.role
 *       )
 *     )
 *     from company_employee
 *     where user_id = :id))
 * FROM user_authentication
 * WHERE id = :id
 * ```
 */
export const wherePrincipal = new PreparedQuery<IWherePrincipalParams,IWherePrincipalResult>(wherePrincipalIR);


