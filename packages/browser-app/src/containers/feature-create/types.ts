import { UnpackThunk } from '../../domain/types'
import { createFeature } from '../../domain/feature/actions';

export type OwnPropsType = {};
export type StatePropsType = {};

export type DispatchPropsType = {
  onSubmit: UnpackThunk<typeof createFeature>
};

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
