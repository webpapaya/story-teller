import sql from 'sql-template-strings'
import { PoolClient } from 'pg'

type ColumnDefinition = {
  column: string
  dataType: string
  isNullable: 'NO' | 'YES'
}

type TableDefinition = {
  tableName: string
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
  timestamptz: 'date'
}

type Overwrites = Partial<typeof DEFAULT_LOOKUP_MAP> & { [key: string]: string }

const toCamelCase = (s: string) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '')
  })
}

const toPascalCase = (s: string) => {
  const camelCased = toCamelCase(s)
  return camelCased.charAt(0).toUpperCase() + camelCased.slice(1)
}

export const columnsForTable = (client: PoolClient) => async (schema: string, table: string): Promise<ColumnDefinition[]> => {
  const result = await client.query(sql`
    SELECT
      column_name as column,
      udt_name as data_type,
      is_nullable
    FROM information_schema.columns
    WHERE table_name = ${table} and table_schema = ${schema}
  `)
  return result.rows
}

export const tablesInSchema = (client: PoolClient) => async (schema: string): Promise<TableDefinition[]> => {
  const result = await client.query(sql`
    SELECT table_name
    FROM information_schema.columns
    WHERE table_schema = ${schema}
    GROUP BY table_name
  `)
  return result.rows
}

export const generateTypesForTable = (table: string, tableDefinition: ColumnDefinition[], overwrites: Overwrites = {}) => {
  const properties = tableDefinition.map((defintion) => {
    const dataType = defintion.isNullable === 'YES'
      ? `${postgresToTypescript(defintion.dataType, overwrites)} | null`
      : postgresToTypescript(defintion.dataType, overwrites)

    return `  ${toCamelCase(defintion.column)}: ${dataType},`
  }).join('\n')

  return [
    `export type ${toPascalCase(table)} {`,
    properties,
    '}'
  ].join('\n')
}

export const postgresToTypescript = (postgresType: string, overwritten: Overwrites = {}) => {
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

type GenerateTypesForSchema = (deps: {
  tablesInSchema: (schema: string) => Promise<TableDefinition[]>
  columnsForTable: (schema: string, table: string) => Promise<ColumnDefinition[]>
  writeFile: (fileContents: string) => Promise<undefined>
}, options: {
    header?: string
    overwrites?: Overwrites
    schema: string
  }) => Promise<void>

export const generateTypesForSchema: GenerateTypesForSchema = async (deps, options) => {
  const tables = await deps.tablesInSchema(options.schema)
  const tableContent = (await Promise.all(tables.map(async (definition) => {
    const columns = await deps.columnsForTable(options.schema, definition.tableName)
    return generateTypesForTable(definition.tableName, columns, options.overwrites)
  })))

  await deps.writeFile([
    options.header,
    ...tableContent
  ].filter((value) => value).join('\n\n'))
}
