import { Company as CompanyNS } from '@story-teller/shared'

export type Company = typeof CompanyNS.aggregate['O']

export type Action<Type extends string, Payload> = {
  type: Type
  payload: Payload
}

export type Actions =
  | Action<'COMPANY/CREATED', Company>
  | Action<'COMPANY/FETCH/SUCCESS', Array<{ payload: Company }>>
