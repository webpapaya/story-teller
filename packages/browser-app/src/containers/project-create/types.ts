import { UnpackThunk } from '../../domain/types'
import { History } from 'history'
import { createProject } from '../../domain/project/actions'

export type OwnPropsType = {
  history: History
};
export type StatePropsType = {};

export type DispatchPropsType = {
  onSubmit: UnpackThunk<typeof createProject>
};

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
