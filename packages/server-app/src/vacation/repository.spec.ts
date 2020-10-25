/** Types generated for queries found in "./src/vacation/repository.sql" */
import { PreparedQuery } from '@pgtyped/query';
import { assertThat, fulfilled, hasProperty, promiseThat, truthy } from 'hamjest';

import { LocalDate } from 'js-joda';
import { count, whereId } from './repository';
import { assertDifference, t } from '../spec-helpers';
import { sequentially } from '../utils/sequentially';
import { ensure } from './repository';
import { vacation } from './use-cases';

it('ensure', t(async ({ client }) => {
  const allAggregates = vacation.build().map((buildAggregate) =>
    async () => {
      await assertDifference({ client }, 'vacation', 1, () => ensure(buildAggregate(), client))
    })

  await sequentially(allAggregates)
}))

it('whereId', t(async ({ client }) => {
  const allAggregates = vacation.build().map((buildAggregate) =>
    async () => {
      const aggregate = buildAggregate()
      await ensure(aggregate, client)
      assertThat(await whereId({ id: aggregate.id }, client), hasProperty('length', 1))
    })

  await sequentially(allAggregates)
}))