import { LIST_REVISIONS_COMMAND } from '@story-teller/shared'

export type Revision = typeof LIST_REVISIONS_COMMAND.response.T[0]
export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'REVISION/FETCH/SUCCESS', Revision[]>

