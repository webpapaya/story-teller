import { History } from 'history'
import { UnpackThunk } from '../../domain/types'
import { requestPasswordReset } from '../../domain/authentication/actions'

export type OwnPropsType = {
  history: History
}
export type StatePropsType = {}

export type DispatchPropsType = {
  onSubmit: UnpackThunk<typeof requestPasswordReset>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
