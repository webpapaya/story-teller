import { Authentication } from '@story-teller/shared'
import { v4 } from 'uuid'
import fetchViaHTTP, { fetchMemoizedViaHTTP } from '../fetch-via-http'
import { ActionCreator } from '../types'
import { Actions } from './types'
import { fetch } from '../fetch'
import { APIError } from '../errors'

export const signIn: ActionCreator<
{ userIdentifier: string, password: string },
void,
Actions
> = (args) => async (dispatch) => {
  const response = await fetch('/authentication/sign-in', {
    method: 'POST',
    body: JSON.stringify(args)
  })
  const parsedBody = await response.json()

  if (response.status !== 200) {
    throw new APIError(parsedBody)
  }

  return parsedBody
}

export const signUp: ActionCreator<
{ userIdentifier: string, password: string },
void,
Actions
> = (args) => async (dispatch) => {
  await fetch(`${process.env.REACT_APP_SERVER_URL}/authentication/sign-up`, {
    method: 'POST',
    body: JSON.stringify({ id: v4(), ...args }),
    headers: {
      'Content-Type': 'application/json',
      'x-story-teller-simulate': 'true'
    }
  })
  return undefined
}

export const signOut = fetchViaHTTP(Authentication.actions.signOut)
export const requestPasswordReset = fetchViaHTTP(Authentication.actions.requestPasswordReset)
export const getAuthenticatedUser = fetchMemoizedViaHTTP(Authentication.queries.session)
