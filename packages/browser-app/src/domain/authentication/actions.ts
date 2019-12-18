import { Authentication } from '@story-teller/shared'
import fetchViaHTTP, { fetchMemoizedViaHTTP } from '../fetch-via-http'

export const signIn = fetchViaHTTP(Authentication.actions.signIn)
export const signUp = fetchViaHTTP(Authentication.actions.signUp)
export const signOut = fetchViaHTTP(Authentication.actions.signOut)
export const requestPasswordReset = fetchViaHTTP(Authentication.actions.requestPasswordReset)
export const getAuthenticatedUser = fetchMemoizedViaHTTP(Authentication.queries.session)
