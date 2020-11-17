import { t } from '../spec-helpers'
import { ensure } from './repository'
import { userAuthentication } from './use-cases'
import { buildTestsForEnsureRepository } from '../utils/verify-ensure-method'

describe('user authentication repository', () => {
  describe.only('ensure', () => {
    buildTestsForEnsureRepository(userAuthentication, 'user_authentication', ensure)
  })
})
