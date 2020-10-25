/** Types generated for queries found in "./src/vacation/repository.sql" */
import { PreparedQuery } from '@pgtyped/query';
import { assertThat, truthy } from 'hamjest';

import { LocalDate } from 'js-joda';
import { t } from '../spec-helpers';
import { sequentially } from '../utils/sequentially';
import { ensure } from './repository';
import { vacation } from './use-cases';

it.only('ensureVacation', t(async ({ client }) => {
  const allAggregates = vacation.build().map((buildAggregate) =>
    async () => {
      await ensure(buildAggregate(), client)
    })


  await sequentially(allAggregates)
}))