import { History } from 'history'
import { UnpackThunk } from '../../domain/types'
import { signIn } from '../../domain/authentication/actions'

export type OwnPropsType = {
  history: History
}
export type StatePropsType = {}

export type DispatchPropsType = {
  onSubmit: UnpackThunk<typeof signIn>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
