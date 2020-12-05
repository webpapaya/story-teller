import { History } from 'history'
import { UnpackThunk } from '../../domain/types'
import { signOut } from '../../domain/authentication/actions'

export type OwnPropsType = {
  history: History
}

export type StatePropsType = {
}

export type DispatchPropsType = {
  sideEffect: () => Promise<any>
  onProjectsSelected: (id: string[]) => void
  onSignOut: UnpackThunk<typeof signOut>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
