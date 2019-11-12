import { Feature, Tags } from '@story-teller/shared'

export type Feature = typeof Feature.aggregate.T
export type Tag = typeof Tags.aggregate.T

export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'FEATURE/FETCH/SUCCESS', Feature[]>
  | Action<'FEATURE_REVISION/FETCH/SUCCESS', Feature[]>

  | Action<'FEATURE/SET_TAGS/SUCCESS', { featureId: string, tags: Tag[] }>
  | Action<'FEATURE/CREATE/SUCCESS', Feature>
  | Action<'FEATURE/UPDATE/SUCCESS', Feature>

