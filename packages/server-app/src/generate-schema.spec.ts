import {
  assertThat,
  equalTo,
  hasProperty,
  hasItems
// @ts-ignore
} from 'hamjest'
import { t } from './spec-helpers'
import {
  generateTypesForTable,
  columnsForTable,
  tablesInSchema,
  postgresToTypescript,
  generateTypesForSchema
} from './generate-schema'
import sinon from 'sinon'

const lastCallArgs = (matcher: any) =>
  hasProperty('lastCall', hasProperty('args', matcher))

describe('generateSchema', () => {
  describe('generateSchema', () => {
    const tablesInSchema = sinon.fake.returns(Promise.resolve([
      { tableName: 'a_table' }
    ]))

    const columnsForTable = sinon.fake.returns(Promise.resolve([
      { column: 'a_column', dataType: 'text', isNullable: 'YES' },
      { column: 'b_column', dataType: 'text', isNullable: 'NO' }
    ]))

    const writeFile = sinon.fake.returns(Promise.resolve())

    it('generates file with header', async () => {
      await generateTypesForSchema({
        tablesInSchema,
        columnsForTable,
        writeFile
      }, { schema: 'public', header: `import { LocalDate } from 'js-joda'` })

      assertThat(writeFile, lastCallArgs(equalTo([
        `import { LocalDate } from 'js-joda'\n\nexport type ATable {\n  aColumn: string | null,\n  bColumn: string,\n}`
      ])))
    })

    it('generates file with overwrites', async () => {
      await generateTypesForSchema({
        tablesInSchema,
        columnsForTable,
        writeFile
      }, { schema: 'public',
        overwrites: {
          text: 'any'
        } })

      assertThat(writeFile, lastCallArgs(equalTo([
        `export type ATable {\n  aColumn: any | null,\n  bColumn: any,\n}`
      ])))
    })
  })

  it('columnsForTable: responds correct columns', t(async ({ withinConnection }) => {
    return withinConnection(async ({ client }) => {
      await client.query(`
        create table if not exists
        public.test (
          id           uuid PRIMARY KEY,
          array_text   text[]
        );
      `)

      const columns = await columnsForTable(client)('public', 'test')
      assertThat(columns, equalTo([
        { column: 'id', dataType: 'uuid', isNullable: 'NO' },
        { column: 'array_text', dataType: '_text', isNullable: 'YES' }
      ]))
    })
  }))

  it('tablesInSchema: responds tables', t(async ({ withinConnection }) => {
    return withinConnection(async ({ client }) => {
      await client.query(`
        create table if not exists
        public.test_table (id uuid PRIMARY KEY);
      `)

      const tables = await tablesInSchema(client)('public')
      assertThat(tables, hasItems(hasProperty('tableName', 'test_table')))
    })
  }))

  it('generateTypesForTable: definition for table', () => {
    const result = generateTypesForTable('a_table', [{
      column: 'a_value',
      dataType: 'text',
      isNullable: 'YES'
    }, {
      column: 'b_value',
      dataType: 'text',
      isNullable: 'NO'
    }])

    assertThat(result, equalTo([
      'export type ATable {',
      '  aValue: string | null,',
      '  bValue: string,',
      '}'
    ].join('\n')))
  })

  describe('postgresToTypescript', () => {
    [
      { pg: 'bpchar', ts: 'string' },
      { pg: '_text', ts: 'string[]' },
      { pg: 'float8', ts: 'number' },
      { pg: 'unknown type', ts: 'any' }
    ].forEach(({ pg, ts }) => {
      it(`converts ${pg} to ${ts}`, () => {
        assertThat(postgresToTypescript(pg), equalTo(ts))
      })
    })

    it('types can be overwritten', () => {
      assertThat(postgresToTypescript('text', { text: 'yolo' }), equalTo('yolo'))
    })

    it('array types can be overwritten as well', () => {
      assertThat(postgresToTypescript('_text', { _text: 'yolo[]' }), equalTo('yolo[]'))
    })
  })
})
