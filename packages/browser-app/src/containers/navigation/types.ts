import { History } from 'history'
import { UnpackThunk } from '../../domain/types'
import { signOut } from '../../domain/authentication/actions'
import { Project } from '@story-teller/shared'

export type OwnPropsType = {
  history: History
}

export type StatePropsType = {
  activeProjects: string[]
  projects: Array<typeof Project.aggregate['O']>
}

export type DispatchPropsType = {
  sideEffect: () => Promise<any>
  onProjectsSelected: (id: string[]) => void
  onSignOut: UnpackThunk<typeof signOut>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
