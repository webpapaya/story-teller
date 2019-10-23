import { Authentication } from "@story-teller/shared"

export type AuthenticatedUser = {
  id: string
  userIdentifier: string
}

export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'USER/SESSION/SUCCESS', typeof Authentication.queries.session['response']['T']>
  | Action<'USER/SIGN_OUT/SUCCESS', void>

