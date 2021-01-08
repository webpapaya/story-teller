export type AuthenticatedUser = {
  id: string
  jwtToken: string
}

export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'AUTHENTICATION/SIGN_IN/SUCCESS', AuthenticatedUser>
  | Action<'AUTHENTICATION/SIGN_OUT/SUCCESS', void>
