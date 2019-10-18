import {
  assertThat,
  hasProperties,
  equalTo,
  falsy as blank,
  truthy as present
// @ts-ignore
} from 'hamjest'

import * as v from 'validation.ts'
import { executeCommand, attributeFiltering } from './command-via-http'
import { success } from './domain'

describe('attributeFiltering', () => {
  [
    {
      validator: v.object({ id: v.number }),
      value: { id: 1 },
      result: { id: 1 }
    },
    {
      validator: v.object({ id: v.number }),
      value: { id: 1, whatever: 1 },
      result: { id: 1 }
    },
    {
      validator: v.object({ nested: v.object({ value: v.number }) }),
      value: { nested: { value: 1, other: 2 } },
      result: { nested: { value: 1 } }
    },
    {
      validator: v.array(v.object({ value: v.number })),
      value: [{ value: 1, other: 1 }],
      result: [{ value: 1 }]
    }
  ].forEach(({ validator, value, result }) => {
    it(`${JSON.stringify(value)} results in ${JSON.stringify(result)}`, () => {
      assertThat(attributeFiltering(validator, value),
        equalTo(result))
    })
  })
})

describe('executeCommand', () => {
  const command = executeCommand({
    verb: 'get',
    model: 'user',
    action: 'session',
    validator: v.object({
      id: v.number,
      userIdentifier: v.string
    }),
    response: v.object({
      userIdentifier: v.string
    })
  }, {
    useCase: () => success({ id: 2, userIdentifier: 'Sepp' }),
    dependencies: {}
  })

  it('with corrupted data, returns validation error', async () => {
    const result = await command({ })
    assertThat(result.body, hasProperties({
      type: 'ValidationError',
      properties: hasProperties({ length: 2 })
    }))
  })

  it('with correctdata, returns filtered response', async () => {
    const result = await command({ id: 1, userIdentifier: 'irrelevant' })
    assertThat(result.body, hasProperties({
      id: blank(),
      userIdentifier: present()
    }))
  })
})
