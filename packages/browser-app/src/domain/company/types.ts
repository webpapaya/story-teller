export type Company = {
  id: string
  jwtToken: string
}

export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  Action<'COMPANY/CREATED', Company>
