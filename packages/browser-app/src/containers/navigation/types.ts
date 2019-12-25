import { UnpackThunk } from '../../domain/types'
import { signOut } from '../../domain/authentication/actions'
import { Project } from '@story-teller/shared';

export type OwnPropsType = {};
export type StatePropsType = {
  selectedProjects: string[],
  projects: typeof Project.aggregate['O'][],
};

export type DispatchPropsType = {
  onProjectsSelected: (id: string[]) => void
  onSignOut: UnpackThunk<typeof signOut>
};

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
