import { Authentication } from '@story-teller/shared'
import { v4 } from 'uuid'
import { decode as decodeJWT } from 'jsonwebtoken'
import fetchViaHTTP, { fetchMemoizedViaHTTP } from '../fetch-via-http'
import { ActionCreator } from '../types'
import { Actions } from './types'
import { fetch } from '../fetch'
import { APIError, DecodingError } from '../errors'
import { memoize } from 'redux-memoize'

const decodeJWTToken = (jwtToken: string) => {
  const decodedToken = decodeJWT(jwtToken)

  if (!(typeof decodedToken === 'object' && decodedToken?.id)) {
    throw new DecodingError()
  }

  return { decodedToken, jwtToken }
}

export const signIn: ActionCreator<
{ userIdentifier: string, password: string },
void,
Actions
> = (args) => async (dispatch) => {
  const response = await fetch('authentication/sign-in', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(args)
  })
  const parsedBody = await response.json()

  if (response.status !== 200) {
    throw new APIError(parsedBody)
  }

  const { jwtToken, decodedToken } = decodeJWTToken(parsedBody.payload.jwtToken)

  dispatch({
    type: 'USER/SESSION/SUCCESS',
    payload: {
      id: decodedToken.id,
      jwtToken: jwtToken
    }
  })
  return parsedBody
}

export const signUp: ActionCreator<
{ userIdentifier: string, password: string },
void,
Actions
> = (args) => async (dispatch) => {
  const response = await fetch('authentication/sign-up', {
    method: 'POST',
    body: JSON.stringify({ id: v4(), ...args })
  })

  const parsedBody = await response.json()

  if (response.status !== 200) {
    throw new APIError(parsedBody)
  }

  return parsedBody
}

export const requestPasswordReset: ActionCreator<
{ userIdentifier: string },
void,
Actions
> = (args) => async (dispatch) => {
  await fetch('authentication/request-password-reset', {
    method: 'POST',
    body: JSON.stringify(args)
  })
}

export const refreshToken: ActionCreator<
void,
void,
Actions
> = memoize((args) => async (dispatch) => {
  const response = await fetch('authentication/refresh-token', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(args)
  })

  const parsedBody = await response.json()
  const { jwtToken, decodedToken } = decodeJWTToken(parsedBody.payload.jwtToken)

  dispatch({
    type: 'USER/SESSION/SUCCESS',
    payload: {
      id: decodedToken.id,
      jwtToken: jwtToken
    }
  })

  return parsedBody
})

export const resetPassword: ActionCreator<
{ id: string, token: string, password: string },
void,
Actions
> = (args) => async (dispatch) => {
  await fetch('authentication/reset-password', {
    method: 'POST',
    body: JSON.stringify(args)
  })
}

export const signOut = fetchViaHTTP(Authentication.actions.signOut)
export const getAuthenticatedUser = fetchMemoizedViaHTTP(Authentication.queries.session)
