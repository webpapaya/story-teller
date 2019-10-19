import { LIST_FEATURES_DEFINITION } from '@story-teller/shared'

export type Feature = typeof LIST_FEATURES_DEFINITION.response.T[0]
export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'FEATURE/FETCH/SUCCESS', Feature[]>
  | Action<'FEATURE/CREATE/INITIATED', Feature>

