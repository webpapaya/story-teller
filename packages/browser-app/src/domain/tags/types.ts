import { Feature, Tags } from '@story-teller/shared'

export type Tag = typeof Tags.aggregate.T

export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'FEATURE/SET_TAGS/SUCCESS', { featureId: string, tags: Tag[] }>
  | Action<'TAG/FETCH/SUCCESS', Tag[]>

