// @ts-ignore
import { assertThat, equalTo, hasProperty } from 'hamjest'
import { Validation, Ok, Err, Codec } from './types'
import {
  string,
  record,
  array,
  literal,
  literalUnion,
  option,
  union,
  nullCodec,
  undefinedCodec,
  matchesRegex,

} from './primitives'

const nonEmptyString = new Validation<string>(
  'nonEmptyString',
  (input, context) => (
    typeof input === 'string' && input.length > 0
      ? Ok(input)
      : Err([{ message: 'can\'t be empty', context }])),
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
  describe('simple validator', () => {
    const validator = record({
      prop: nonEmptyString
    })

    it('responds correct object for valid record', () => {
      assertThat(validator.decode({
        prop: 'not empty'
      }).get(), equalTo({ prop: 'not empty' }))
    })

    it('removes to additional properties', () => {
      assertThat(validator.decode({
        prop: 'not empty',
        additionalProp: 'test'
      }).get(), equalTo({ prop: 'not empty' }))
    })

    it('responds error', () => {
      assertThat(validator.decode({
        prop: ''
      }).get(), hasProperty('0', hasProperty('context', hasProperty('path', '$.prop'))))
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

    assertThat(validator.decode(value).get(),
      equalTo(value))
  })
})

describe('array', () => {
  const validator = array(nonEmptyString)

  it('responds correct array when valid', () => {
    assertThat(validator.decode(['empty']).get(),
      equalTo(['empty']))
  })

  it('responds errors when invalid', () => {
    assertThat(validator.decode(['']).get(),
      hasProperty('0', hasProperty('context', hasProperty('path', '$[0]'))))
  })
})

describe('option', () => {
  const validator = option(string)

  describe('decode', () => {
    it('responds correct string', () => {
      assertThat(validator.decode('a string').get(),
        equalTo('a string'))
    })

    it('responds undefined', () => {
      assertThat(validator.decode(undefined).get(),
        equalTo(undefined))
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

  describe('is', () => {
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
  const validator = union([nonEmptyString, literal(1)])

  describe('decode', () => {
    it('responds as it was for valid value', () => {
      assertThat(validator.decode(1).get(), equalTo(1))
    })

    it('responds error for empty string', () => {
      assertThat(validator.decode('').isOk(), equalTo(false))
    })
  })

  describe('is', () => {
    it('responds true for valid value', () => {
      assertThat(validator.decode('').isOk(), equalTo(false))
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

describe('compose', () => {
  // const compose = <A, O, I>(validators: Codec<A, O, I>[]): Codec<A, O, I> => {
  //   const [firstValidator, ...otherValidators] = validators;

  //   return new Codec<A, O, I>(
  //     validators.reverse().map((validation) => validation.name).join(' > '),
  //     (input) => validators.every((validation) => validation.is(input)),
  //     (input, context) => {

  //       let result = firstValidator.decode(input, context);
  //       for(let validator of otherValidators) {
  //         if (!result.isOk()) {
  //           return result
  //         }
  //         result = validator.decode(input, context)
  //       }
  //       return result
  //     },
  //     (input) => {
  //       let result = firstValidator.encode(input);
  //       for(let validator of otherValidators) {
  //         result = validator.encode(input)
  //       }
  //       return result
  //     }
  //   )
  // }

  it('works', () => {
    const uuid = string.pipe(matchesRegex('uuid', /\d+/))
  })
})
