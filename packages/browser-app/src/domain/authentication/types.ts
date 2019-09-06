export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'USER/SIGN_IN/SUCCESS', void>
  | Action<'USER/SIGN_IN/ERROR', void>
