import { t } from '../../spec-helpers'
import { ensure, where, create } from './index'
import { userAuthentication } from '../domain'
import { buildTestsForEnsureRepository } from '../../utils/verify-ensure-method'
import { assertThat, equalTo, hasProperty, promiseThat, rejected } from 'hamjest'

describe('user authentication repository', () => {
  describe('ensure', () => {
    buildTestsForEnsureRepository(userAuthentication, 'user_authentication', ensure)
  })

  describe('create', () => {
    it('WHEN record already exists, throws repository error', t(async (clients) => {
      const record = userAuthentication.build()[0]()
      await create(record, clients)
      return await promiseThat(create(record, clients), rejected(
        hasProperty('cause', 'Record does already exist')))
    }))
  })

  describe('where', () => {
    it('finds previously stored record', t(async (clients) => {
      const record = userAuthentication.build()[0]()
      await ensure(record, clients)
      const result = await where({ id: record.id }, clients)
      assertThat(JSON.parse(JSON.stringify(result)),
        equalTo(JSON.parse(JSON.stringify(record))))
    }))
  })
})
