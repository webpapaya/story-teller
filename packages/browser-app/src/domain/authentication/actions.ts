import { Authentication } from '@story-teller/shared'
import { v4 } from 'uuid'
import fetchViaHTTP, { fetchMemoizedViaHTTP } from '../fetch-via-http'
import { ActionCreator } from '../types'
import { Actions } from './types'

export const signIn: ActionCreator<
{ userIdentifier: string, password: string },
void,
Actions
> = (args) => async (dispatch) => {
  await fetch(`${process.env.REACT_APP_SERVER_URL}/authentication/sign-in`, {
    method: 'POST',
    body: JSON.stringify(args),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return undefined
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
      'Content-Type': 'application/json'
    }
  })
  return undefined
}

export const signOut = fetchViaHTTP(Authentication.actions.signOut)
export const requestPasswordReset = fetchViaHTTP(Authentication.actions.requestPasswordReset)
export const getAuthenticatedUser = fetchMemoizedViaHTTP(Authentication.queries.session)
