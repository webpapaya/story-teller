import { SESSION_COMMAND, SIGN_IN_COMMAND, SIGN_UP_COMMAND, SIGN_OUT_COMMAND, REQUEST_PASSWORD_RESET_COMMAND } from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const signIn = fetchViaHTTP(SIGN_IN_COMMAND)
export const signUp = fetchViaHTTP(SIGN_UP_COMMAND)
export const signOut = fetchViaHTTP(SIGN_OUT_COMMAND)
export const requestPasswordReset = fetchViaHTTP(REQUEST_PASSWORD_RESET_COMMAND);
export const getAuthenticatedUser = fetchViaHTTP(SESSION_COMMAND)
