import { t } from '../../spec-helpers'
import { ensure, where } from './index'
import { userAuthentication } from '../domain'
import { buildTestsForEnsureRepository } from '../../utils/verify-ensure-method'
import { assertThat, equalTo } from 'hamjest'

describe('user authentication repository', () => {
  describe('ensure', () => {
    buildTestsForEnsureRepository(userAuthentication, 'user_authentication', ensure)
  })

  describe('where', () => {
    it('finds previously stored record', t(async (clients) => {
      const record = userAuthentication.build()[0]()
      await ensure(record, clients)
      const result = await where({id: record.id}, clients)
      assertThat(JSON.parse(JSON.stringify(result)),
        equalTo(JSON.parse(JSON.stringify(record))))
    }))
  })
})
