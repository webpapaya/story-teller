export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'USER/FETCH/SUCCESS', object>
  | Action<'USER/FETCH/ERROR', void>
  | Action<'USER/SIGN_UP/SUCCESS', void>
  | Action<'USER/SIGN_UP/ERROR', void>
  | Action<'USER/SIGN_IN/SUCCESS', void>
  | Action<'USER/SIGN_IN/ERROR', void>

export type UserAuthentication = {
  id: string
  userIdentifier: string
  createdAt: string
  confirmationToken: string | null
  confirmedAt: string | null
  password: string
  passwordResetToken: string | null
  passwordResetCreatedAt: string | null
  passwordChangedAt: string | null
}
