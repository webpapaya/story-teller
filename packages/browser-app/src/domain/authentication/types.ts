export type AuthenticatedUser = {
  id: string
  jwtToken: string
}

export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'USER/SESSION/SUCCESS', AuthenticatedUser>
  | Action<'USER/SIGN_OUT/SUCCESS', void>
