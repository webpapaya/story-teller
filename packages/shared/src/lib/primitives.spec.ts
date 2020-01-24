// @ts-ignore
import { assertThat, equalTo, hasProperty, everyItem } from 'hamjest'
import { LocalDate } from 'js-joda'
import { AnyCodec } from './types'
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
  undefinedCodec,
  uuid,
  dateInFuture,
  dateInPast,
  dateToday,
  clampedString,
  nonEmptyString
} from './index'
import { number, integer, positiveInteger, negativeInteger } from './primitives'

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

describe('string', () => {
  describe('shrink', () => {
    it('returns string truncated by last character', () => {
      const value = 'AB'
      assertThat(string.shrink(value).get(),
        equalTo('A'))
    })

    it('returns string with 1 character returns empty string', () => {
      assertThat(string.shrink('A').get(),
        equalTo(''))
    })

    it('empty string returns error', () => {
      assertThat(string.shrink('').isOk(),
        equalTo(false))
    })
  })
})

describe('record', () => {
  it('stringifies record, properly', () => {
    const validator = record({
      prop: option(nonEmptyString),
      nested: record({
        prop: nonEmptyString
      })
    })

    assertThat(JSON.stringify(validator), equalTo(JSON.stringify({
      type: 'object',
      required: ['prop', 'nested'],
      properties: {
        prop: {
          oneOf: [{
            type: 'clampedString(min: 1, max: Infinity)'
          }, {
            const: 'undefined'
          }]
        },
        nested: {
          type: 'object',
          required: ['prop'],
          properties: {
            prop: {
              type: 'clampedString(min: 1, max: Infinity)'
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
      }).get(), equalTo([{ context: { path: '$.prop' }, message: "needs to be longer than 1 characters" }]))
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

  it('can be nested', () => {
    const schema = record({
      ...record({ a: string }).schema,
      ...record({ b: string }).schema
    })
    assertThat(schema.is({ a: 'whatever', b: 'whatever' }), equalTo(true))
  })
})

describe('array', () => {
  it('stringifies union properly', () => {
    const validator = array(nonEmptyString)
    assertThat(JSON.stringify(validator), JSON.stringify({
      type: 'array',
      items: {
        type: 'clampedString(min: 1, max: Infinity)'
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

  describe('shrink', () => {
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
      '{"oneOf":[{"type":"clampedString(min: 1, max: Infinity)"},{"const":1}]}')
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

  it('stringifies union properly', () => {
    assertThat(JSON.stringify(validator),
      '{"oneOf":[{"const":1},{"const":2},{"const":"test"}]}')
  })

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

describe('integer', () => {
  describe('decode', () => {
    [
      { input: -1, isValid: true },
      { input: 0, isValid: true },
      { input: 1, isValid: true },
      { input: '1', isValid: false },
      { input: 1.2, isValid: false },
      { input: '1.2', isValid: false },
      { input: NaN, isValid: false },
      { input: Number.POSITIVE_INFINITY, isValid: false },
      { input: undefined, isValid: false }
    ].forEach(({ input, isValid }) => {
      it(`${input} is ${isValid ? 'valid' : 'invalid'}`, () => {
        assertThat(integer.decode(input).isOk(), equalTo(isValid))
      })
    })
  })
})

describe('positiveInteger', () => {
  describe('decode', () => {
    [
      { input: -1, isValid: false },
      { input: 0, isValid: true },
      { input: 1, isValid: true }
    ].forEach(({ input, isValid }) => {
      it(`${input} is ${isValid ? 'valid' : 'invalid'}`, () => {
        assertThat(positiveInteger.decode(input).isOk(), equalTo(isValid))
      })
    })
  })
})

describe('negativeInteger', () => {
  describe('decode', () => {
    [
      { input: -1, isValid: true },
      { input: 0, isValid: true },
      { input: 1, isValid: false }
    ].forEach(({ input, isValid }) => {
      it(`${input} is ${isValid ? 'valid' : 'invalid'}`, () => {
        assertThat(negativeInteger.decode(input).isOk(), equalTo(isValid))
      })
    })
  })
})

describe('build', () => {
  [
    string,
    clampedString(1, 1000),
    number,
    union([literal(1), literal('hallo'), option(literal(3))]),
    record({
      a: option(literal(1)),
      b: option(literal(2)),
      c: literal(3)
    }),
    uuid,
    date,
    dateInFuture,
    dateInPast,
    dateToday,
    array(union([literal(1), literal('hallo')]))
  ].map((validator: AnyCodec) => {
    it(validator.name, () => {
      const values = validator.build()
      assertThat(values.map((y) => validator.is(y())),
        everyItem(equalTo(true)))
    })
  })
})
