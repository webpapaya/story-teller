import { v4 } from 'uuid'
import { ActionCreator } from '../types'
import { Actions } from './types'
import { fetch } from '../fetch'

export const createCompany: ActionCreator<{name: string}, void, Actions> = (params) => async () => {
  await fetch('company/create', {
    rawBody: {
      id: v4(),
      name: params.name
    }
  })
}
