import {
  assertThat,
  equalTo,
  hasProperty,
  hasItems,
// @ts-ignore
} from 'hamjest'
import { t } from './spec-helpers'
import {
  generateTypesForTable,
  columnsForTable,
  tablesInSchema,
  postgresToTypescript
} from './generate-schema'

describe('generateSchema', () => {
  it('columnsForTable: responds correct columns', t(async ({ withinConnection }) => {
    return withinConnection(async ({ client }) => {
      await client.query(`
        create table if not exists
        public.test (
          id           uuid PRIMARY KEY,
          camel_cased  text,
          array_text   text[]
        );
      `)

      const columns = await columnsForTable(client, 'public', 'test')
      assertThat(columns, equalTo([
        { column: 'id', dataType: 'uuid', isNullable: 'NO' },
        { column: 'camelCased', dataType: 'text', isNullable: 'YES' },
        { column: 'arrayText', dataType: '_text', isNullable: 'YES' }
      ]))
    })
  }))

  it('tablesInSchema: responds tables', t(async ({ withinConnection }) => {
    return withinConnection(async ({ client }) => {
      await client.query(`
        create table if not exists
        public.test (id uuid PRIMARY KEY);
      `)

      const tables = await tablesInSchema(client, 'public')
      assertThat(tables, hasItems(hasProperty('tableName', 'test')))
    })
  }))

  it('generateTypesForTable: definition for table', () => {
    const result = generateTypesForTable('ATable', [{
      column: 'aValue',
      dataType: 'text',
      isNullable: 'YES'
    }, {
      column: 'bValue',
      dataType: 'text',
      isNullable: 'NO'
    }])

    assertThat(result, equalTo([
      'export type ATable {',
      '  aValue: string | null,',
      '  bValue: string,',
      '}',
    ].join('\n')))
  })

  describe('postgresToTypescript', () => {
    [
      { pg: 'bpchar', ts: 'string'},
      { pg: 'char', ts: 'string'},
      { pg: 'varchar', ts: 'string'},
      { pg: 'text', ts: 'string'},
      { pg: 'citext', ts: 'string'},
      { pg: 'uuid', ts: 'string'},
      { pg: 'bytea', ts: 'string'},
      { pg: 'inet', ts: 'string'},
      { pg: 'time', ts: 'string'},
      { pg: 'timetz', ts: 'string'},
      { pg: 'interval', ts: 'string'},
      { pg: 'name', ts: 'string'},
      { pg: '_text', ts: 'string[]'},

      { pg: 'int2', ts: 'number' },
      { pg: 'int4', ts: 'number' },
      { pg: 'int8', ts: 'number' },
      { pg: 'float4', ts: 'number' },
      { pg: 'float8', ts: 'number' },
      { pg: 'numeric', ts: 'number' },
      { pg: 'money', ts: 'number' },
      { pg: 'oid', ts: 'number' },
      { pg: 'unknown type', ts: 'any' },
    ].forEach(({ pg, ts }) => {
      it(`converts ${pg} to ${ts}`, () => {
        assertThat(postgresToTypescript(pg), equalTo(ts))
      })
    })

    it('types can be overwritten', () => {
      assertThat(postgresToTypescript('text', {text: 'yolo'}), equalTo('yolo'))
    })

    it('array types can be overwritten as well', () => {
      assertThat(postgresToTypescript('_text', {_text: 'yolo[]'}), equalTo('yolo[]'))
    })
  })
})
