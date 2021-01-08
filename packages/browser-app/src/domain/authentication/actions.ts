import { Authentication } from '@story-teller/shared'
import { decode as decodeJWT } from 'jsonwebtoken'
import fetchViaHTTP, { fetchMemoizedViaHTTP } from '../fetch-via-http'
import { ActionCreator } from '../types'
import { Actions } from './types'
import { DecodingError } from '../errors'
import { memoize } from 'redux-memoize'

const decodeJWTToken = (jwtToken: string) => {
  const decodedToken = decodeJWT(jwtToken)

  if (!(typeof decodedToken === 'object' && decodedToken?.id)) {
    throw new DecodingError()
  }

  return { decodedToken, jwtToken }
}

export const refreshToken: ActionCreator<
void,
void,
Actions
> = memoize({ ttl: 50000 }, () => async (dispatch, _, { http }) => {
  const response = await http.post('authentication/refresh-token', {})

  const parsedBody = await response.json()
  const { jwtToken, decodedToken } = decodeJWTToken(parsedBody.payload.jwtToken)

  dispatch({
    type: 'AUTHENTICATION/SIGN_IN/SUCCESS',
    payload: {
      id: decodedToken.id,
      jwtToken: jwtToken
    }
  })

  return parsedBody
})

export const signOut = fetchViaHTTP(Authentication.actions.signOut)

export const signIn = fetchViaHTTP(Authentication.actions.signIn)

export const signUp = fetchViaHTTP(Authentication.actions.signUp)

export const requestPasswordReset = fetchViaHTTP(Authentication.actions.requestPasswordReset)

export const resetPassword = fetchViaHTTP(Authentication.actions.resetPasswordByToken)

export const getAuthenticatedUser = fetchMemoizedViaHTTP(Authentication.queries.session)
