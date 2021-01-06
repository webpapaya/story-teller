import { Authentication } from '@story-teller/shared'
import { v4 } from 'uuid'
import { decode as decodeJWT } from 'jsonwebtoken'
import { fetchMemoizedViaHTTP } from '../fetch-via-http'
import { ActionCreator } from '../types'
import { Actions } from './types'
import { fetch } from '../fetch'
import { APIError, DecodingError } from '../errors'

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

export const signOut: ActionCreator<
void,
void,
Actions
> = () => async (dispatch) => {
  const response = await fetch('authentication/sign-out', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({})
  })

  if (response.status !== 200) {
    throw new APIError()
  }

  dispatch({
    type: 'USER/SIGN_OUT/SUCCESS',
    payload: undefined
  })
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
> = () => async (dispatch) => {
  const response = await fetch('authentication/refresh-token', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({})
  })

  const parsedBody = await response.json()
  const { jwtToken, decodedToken } = decodeJWTToken(parsedBody.payload.jwtToken)

  // TODO: find better solution
  setTimeout(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    dispatch(refreshToken())
  }, +new Date(decodedToken.exp * 1000 - 10000) - (+new Date()))

  dispatch({
    type: 'USER/SESSION/SUCCESS',
    payload: {
      id: decodedToken.id,
      jwtToken: jwtToken
    }
  })

  return parsedBody
}

export const resetPassword: ActionCreator<
{ id: string, token: string, password: string },
void,
Actions
> = (args) => async (dispatch) => {
  await fetch('authentication/reset-password-by-token', {
    method: 'POST',
    body: JSON.stringify(args)
  })
}

export const getAuthenticatedUser = fetchMemoizedViaHTTP(Authentication.queries.session)
