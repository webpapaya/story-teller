import { SESSION_DEFINITION, SIGN_IN_DEFINITION, SIGN_UP_DEFINITION, SIGN_OUT_DEFINITION, REQUEST_PASSWORD_RESET_DEFINITION } from '@story-teller/shared'
import fetchViaHTTP from '../fetch-via-http'

export const signIn = fetchViaHTTP(SIGN_IN_DEFINITION)
export const signUp = fetchViaHTTP(SIGN_UP_DEFINITION)
export const signOut = fetchViaHTTP(SIGN_OUT_DEFINITION)
export const requestPasswordReset = fetchViaHTTP(REQUEST_PASSWORD_RESET_DEFINITION);
export const getAuthenticatedUser = fetchViaHTTP(SESSION_DEFINITION)
