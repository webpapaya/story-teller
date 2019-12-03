import {
  assertThat,
  hasProperties,
  equalTo,
  falsy as blank,
  truthy as present
// @ts-ignore
} from 'hamjest'

import {v} from '@story-teller/shared'
import { executeCommand, attributeFiltering } from './command-via-http'
import { Ok } from 'space-lift'

describe('attributeFiltering', () => {
  [
    {
      validator: v.record({ id: v.number }),
      value: { id: 1 },
      result: { id: 1 }
    },
    {
      validator: v.record({ id: v.number }),
      value: { id: 1, whatever: 1 },
      result: { id: 1 }
    },
    {
      validator: v.record({ nested: v.record({ value: v.number }) }),
      value: { nested: { value: 1, other: 2 } },
      result: { nested: { value: 1 } }
    },
    {
      validator: v.array(v.record({ value: v.number })),
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
    validator: v.record({
      id: v.number,
      userIdentifier: v.string
    }),
    response: v.record({
      userIdentifier: v.string
    })
  }, {
    useCase: () => Ok({ id: 2, userIdentifier: 'Sepp' }),
    auth: { user: null },
    dependencies: {}
  })

  it('with corrupted data, returns validation error', async () => {
    const result = await command({ })
    assertThat(result.get(), hasProperties({ length: 2 }))
  })

  it('with correctdata, returns filtered response', async () => {
    const result = await command({ id: 1, userIdentifier: 'irrelevant' })
    assertThat(result.get(), hasProperties({
      id: blank(),
      userIdentifier: present()
    }))
  })
})
