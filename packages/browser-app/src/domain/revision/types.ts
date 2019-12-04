import { Revision } from '@story-teller/shared'

export type Revision = typeof Revision.aggregate.O
export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'REVISION/FETCH/SUCCESS', Revision[]>