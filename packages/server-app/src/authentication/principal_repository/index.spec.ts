import { userAuthentication } from '../domain'
import { t } from '../../spec-helpers'
import * as userAuthenticationRepo from '../user_authentication_repository'
import * as principalRepo from './index'
import { assertThat, hasProperties } from 'hamjest'

describe('where', () => {
  it('finds principal', t(async (clients) => {
    const userAuth = await userAuthenticationRepo
      .ensure(userAuthentication.build()[0](), clients)

    assertThat(await principalRepo.where(userAuth, clients), hasProperties({
      id: userAuth.id,
      employedIn: []
    }))
  }))
})
