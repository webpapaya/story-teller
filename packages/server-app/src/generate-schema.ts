import sql from 'sql-template-strings'
import { PoolClient } from 'pg'

type ColumnDefinition = {
  column: string,
  dataType: string,
  isNullable: 'NO' | 'YES'
}

type TableDefinition = {
  tableName: string,
}

const DEFAULT_LOOKUP_MAP = {
  bpchar: 'string',
  char: 'string',
  varchar: 'string',
  text: 'string',
  citext: 'string',
  uuid: 'string',
  bytea: 'string',
  inet: 'string',
  time: 'string',
  timetz: 'string',
  interval: 'string',
  name: 'string',

  int2: 'number',
  int4: 'number',
  int8: 'number',
  float4: 'number',
  float8: 'number',
  numeric: 'number',
  money: 'number',
  oid: 'number',

  bool: 'boolean',

  json: 'object',
  jsonb: 'object',

  date: 'date',
  timestamp: 'date',
  timestamptz: 'date',
}

type OverwritableTypes = Partial<typeof DEFAULT_LOOKUP_MAP> & { [key: string]: string }

export const columnsForTable = async (client: PoolClient, schema: string, table: string): Promise<ColumnDefinition[]> => {
  const result = await client.query(sql`
    SELECT
      replace(
        lower(substring(column_name from 1 for 1)) ||
        substring(initcap(column_name) from 2 for length(column_name))
      , '_', '') as column,
      udt_name as data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_name = ${table} and table_schema = ${schema}
  `)
  return result.rows
}

export const tablesInSchema = async (client: PoolClient, schema: string): Promise<TableDefinition[]> => {
  const result = await client.query(sql`
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = ${schema}
    GROUP BY table_name
  `)
  return result.rows
}

export const generateTypesForTable = (table: string, tableDefinition: ColumnDefinition[]) => {
  const properties = tableDefinition.map((defintion) => {
    const dataType = defintion.isNullable === 'YES'
      ? `${postgresToTypescript(defintion.dataType)} | null`
      : postgresToTypescript(defintion.dataType)

    return `  ${defintion.column}: ${dataType},`
  }).join('\n')

  return [
    `export type ${table} {`,
    properties,
    '}'
  ].join('\n')
}

export const postgresToTypescript = (postgresType: string, overwritten: OverwritableTypes = {}) => {
  const lookup = { ...DEFAULT_LOOKUP_MAP, ...overwritten }
  const getValue = (key: string) => {
    // @ts-ignore
    return lookup[key]
  }

  if (getValue(postgresType)) {
    return getValue(postgresType)
  } else if (getValue(postgresType.substr(1))) {
    return `${getValue(postgresType.substr(1))}[]`
  } else {
    return 'any'
  }
}
