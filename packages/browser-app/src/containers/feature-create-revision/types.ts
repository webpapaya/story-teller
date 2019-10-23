import { History } from 'history';
import { UnpackThunk } from '../../domain/types'
import { Feature } from '../../domain/feature/types';
import { updateFeature } from '../../domain/feature/actions';
import { Revision } from '../../domain/revision/types';

export type OwnPropsType = {
  id: string,
  history: History
};

export type StatePropsType = {
  defaultValues?: Feature,
  revision: Revision[]
};

export type DispatchPropsType = {
  sideEffect: () => Promise<void>
  onSubmit: UnpackThunk<typeof updateFeature>
};

export type OrganismPropsType = StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
