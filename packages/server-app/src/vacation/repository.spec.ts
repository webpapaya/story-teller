/** Types generated for queries found in "./src/vacation/repository.sql" */
import { PreparedQuery } from '@pgtyped/query'
import { assertThat, fulfilled, hasProperty, promiseThat, truthy } from 'hamjest'

import { LocalDate } from 'js-joda'
import { count, whereId, ensure } from './repository'
import { assertDifference, t } from '../spec-helpers'
import { sequentially } from '../utils/sequentially'

import { vacation } from './use-cases'

it('ensure', t(async (clients) => {
  const allAggregates = vacation.build().map((buildAggregate) =>
    async () => {
      await assertDifference(clients, 'vacation', 1, () => ensure(buildAggregate(), clients))
    })

  await sequentially(allAggregates)
}))

it('whereId', t(async (clients) => {
  const allAggregates = vacation.build().map((buildAggregate) =>
    async () => {
      const aggregate = buildAggregate()
      await ensure(aggregate, clients)
      assertThat(await whereId({ id: aggregate.id }, clients), hasProperty('length', 1))
    })

  await sequentially(allAggregates)
}))
