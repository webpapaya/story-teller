
export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Link = {
  actionName: string
  aggregateName: string
  method: string
  route: string
}

export type State = Record<string, Link>

export type Actions =
  | Action<string, Array<{ payload: { id: string }, links: Link }>>
  | Action<string, { payload: { id: string }, links: Link }>
