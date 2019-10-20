import { UnpackThunk } from '../../domain/types'
import { createFeature, whereFeature } from '../../domain/feature/actions';
import { Feature } from '../../domain/feature/types';

export type OwnPropsType = {
  id: string,
};

export type StatePropsType = {
  defaultValues?: Feature
};

export type DispatchPropsType = {
  sideEffect: UnpackThunk<typeof whereFeature>
  onSubmit: UnpackThunk<typeof createFeature>
};

export type OrganismPropsType = StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
