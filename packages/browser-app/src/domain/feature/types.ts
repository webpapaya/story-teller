import { LIST_FEATURES_COMMAND } from '@story-teller/shared'

export type Feature = typeof LIST_FEATURES_COMMAND.response.T[0]
export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'FEATURE/FETCH/SUCCESS', Feature[]>
  | Action<'FEATURE_REVISION/FETCH/SUCCESS', Feature[]>

  | Action<'FEATURE/CREATE/SUCCESS', Feature>
  | Action<'FEATURE/CREATE_REVISION/SUCCESS', Feature>

