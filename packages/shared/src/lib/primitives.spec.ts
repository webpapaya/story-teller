// @ts-ignore
import { assertThat, equalTo, hasProperty } from 'hamjest'
import { LocalDate } from 'js-joda'
import { Validation, Ok, Err } from './types'
import {
  date,
  string,
  record,
  array,
  literal,
  literalUnion,
  option,
  union,
  nullCodec,
  undefinedCodec
} from './index'

const nonEmptyString = new Validation<string>(
  'nonEmptyString',
  (input, context) => (
    typeof input === 'string' && input.length > 0
      ? Ok(input)
      : Err([{ message: 'can\'t be empty', context }]))
)

describe('nonEmptyString', () => {
  [
    { value: 'test', valid: true },
    { value: '2c2182c4-5d7e-4749-99e9-c4127a2e8358', valid: true },
    { value: null, valid: false }
  ].forEach(({ value, valid }) => {
    it(`value ${value} ${valid ? 'is valid' : 'is invalid'}`, () => {
      assertThat(nonEmptyString.decode(value).isOk(), equalTo(valid))
    })
  })
})

describe('record', () => {
  it('stringifies record, properly', () => {
    const validator = record({
      prop: nonEmptyString,
      nested: record({
        prop: nonEmptyString
      })
    })

    assertThat(JSON.stringify(validator), equalTo(JSON.stringify({
      type: 'object',
      properties: {
        prop: {
          type: 'nonEmptyString'
        },
        nested: {
          type: 'object',
          properties: {
            prop: {
              type: 'nonEmptyString'
            }
          }
        }
      }
    })))
  })

  describe('decode', () => {
    const validator = record({
      prop: nonEmptyString
    })

    it('responds correct object for valid record', () => {
      assertThat(validator.decode({
        prop: 'not empty'
      }).get(), equalTo({ prop: 'not empty' }))
    })

    it('removes additional properties', () => {
      assertThat(validator.decode({
        prop: 'not empty',
        additionalProp: 'test'
      }).get(), equalTo({ prop: 'not empty' }))
    })

    it('responds error', () => {
      assertThat(validator.decode({
        prop: ''
      }).get(), equalTo([{ context: { path: '$.prop' }, message: "can't be empty" }]))
    })
  })

  it('works with nested records as well', () => {
    const validator = record({
      prop: nonEmptyString,
      nested: record({
        prop: nonEmptyString
      })
    })

    const value = {
      prop: 'not empty',
      nested: {
        prop: 'hallo'
      }
    }

    assertThat(validator.decode(value).get(), equalTo(value))
  })

  describe('encode', () => {
    const schema = record({
      test: date
    })

    it('decodes dates properly', () => {
      assertThat(schema.encode({ test: LocalDate.parse('2000-01-01') }),
        equalTo({ test: '2000-01-01' }))
    })
  })

  describe('is', () => {
    const schema = record({ test: date })

    it('verifies local date properly', () => {
      assertThat(schema.is({ test: LocalDate.parse('2000-01-01') }), equalTo(true))
    })

    it('responds false when an invalid object is passed in', () => {
      assertThat(schema.is({ test: 'whatever' }), equalTo(false))
    })
  })
})

describe('array', () => {
  it('stringifies union properly', () => {
    const validator = array(nonEmptyString)
    assertThat(JSON.stringify(validator), JSON.stringify({
      type: 'array',
      items: {
        type: 'nonEmptyString'
      }
    }))
  })
  describe('decode', () => {
    const validator = array(nonEmptyString)

    it('responds correct array when valid', () => {
      assertThat(validator.decode(['empty']).get(), equalTo(['empty']))
    })

    it('responds errors when invalid', () => {
      assertThat(validator.decode(['']).get(), hasProperty('length', 1))
    })
  })

  describe('is', () => {
    const validator = array(date)
    it('returns true when all elements comply to schema', () => {
      assertThat(validator.is([LocalDate.parse('2000-01-01')]), equalTo(true))
    })

    it('returns false when one elements does not comply to schema', () => {
      assertThat(validator.is([LocalDate.parse('2000-01-01'), '2000-01-01']), equalTo(false))
    })
  })

  describe('encode', () => {
    const validator = array(date)

    it('encodes recursively', () => {
      assertThat(validator.encode([LocalDate.parse('2000-01-01')]), equalTo(['2000-01-01']))
    })
  })
})

describe('option', () => {
  const validator = option(string)

  describe('decode', () => {
    it('responds correct string', () => {
      assertThat(validator.decode('a string').get(), equalTo('a string'))
    })

    it('responds undefined', () => {
      assertThat(validator.decode(undefined).get(), equalTo(undefined))
    })
  })

  describe('is', () => {
    it('responds true for string', () => {
      assertThat(validator.is('a string'), equalTo(true))
    })

    it('responds true for undefined', () => {
      assertThat(validator.is(undefined), equalTo(true))
    })

    it('responds false for number', () => {
      assertThat(validator.is(1), equalTo(false))
    })
  })

  describe('encode', () => {
    it('decode responds value as is', () => {
      assertThat(validator.encode('a string'), equalTo('a string'))
    })
  })
})

describe('literal', () => {
  it('responds literal when same', () => {
    assertThat(literal('x').decode('x').get(), equalTo('x'))
  })

  it('responds error when literal differs', () => {
    assertThat(literal('y').decode('x').isOk(), equalTo(false))
  })
})

describe('union', () => {
  it('stringifies union properly', () => {
    const validator = union([nonEmptyString, literal(1)])
    assertThat(JSON.stringify(validator),
      '{"oneOf":[{"type":"nonEmptyString"},{"const":1}]}')
  })

  describe('decode', () => {
    const validator = union([nonEmptyString, literal(1)])
    it('responds as it was for valid value', () => {
      assertThat(validator.decode(1).get(), equalTo(1))
    })

    it('responds error for empty string', () => {
      assertThat(validator.decode('').isOk(), equalTo(false))
    })
  })

  describe('is', () => {
    const validator = union([nonEmptyString, literal(1)])
    it('responds true for valid value', () => {
      assertThat(validator.decode('').isOk(), equalTo(false))
    })
  })

  describe('encode', () => {
    const validator = union([date, literal(1)])
    it('responds true for valid value', () => {
      assertThat(validator.encode(LocalDate.parse('2000-01-01')), equalTo('2000-01-01'))
    })
  })
})

describe('literalUnion', () => {
  const validator = literalUnion([1, 2, 'test'])

  describe('encode', () => {
    it('responds literal when valid', () => {
      assertThat(validator.decode(1).get(), equalTo(1))
    })

    it('responds error with unknown literal', () => {
      assertThat(validator.decode('').isOk(), equalTo(false))
    })
  })
})

describe('nullCodec', () => {
  describe('encode', () => {
    it('responds literal when valid', () => {
      assertThat(nullCodec.decode(null).get(), equalTo(null))
    })

    it('responds error with unknown literal', () => {
      assertThat(nullCodec.decode('').isOk(), equalTo(false))
    })
  })
})

describe('undefinedCodec', () => {
  describe('encode', () => {
    it('responds literal when valid', () => {
      assertThat(undefinedCodec.decode(undefined).get(), equalTo(undefined))
    })

    it('responds error with unknown literal', () => {
      assertThat(undefinedCodec.decode('').isOk(), equalTo(false))
    })
  })
})
