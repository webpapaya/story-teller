import { Project } from '@story-teller/shared'

export type Project = typeof Project.aggregate.O

export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'PROJECT/FETCH/SUCCESS', Project[]>
  | Action<'PROJECT/CREATE/SUCCESS', Project>
