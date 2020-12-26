import { History } from 'history'
import { UnpackThunk } from '../../domain/types'
import { resetPassword } from '../../domain/authentication/actions'

export type OwnPropsType = {
  history: History
}
export type StatePropsType = {
  defaultValues: {
    id: string
    token: string
  }
}

export type DispatchPropsType = {
  onSubmit: UnpackThunk<typeof resetPassword>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
