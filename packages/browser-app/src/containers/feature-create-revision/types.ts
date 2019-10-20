import { History } from 'history';
import { UnpackThunk } from '../../domain/types'
import { whereFeature, createFeatureRevision } from '../../domain/feature/actions';
import { Feature } from '../../domain/feature/types';


export type OwnPropsType = {
  id: string,
  history: History
};

export type StatePropsType = {
  defaultValues?: Feature
};

export type DispatchPropsType = {
  sideEffect: UnpackThunk<typeof whereFeature>
  onSubmit: UnpackThunk<typeof createFeatureRevision>
};

export type OrganismPropsType = StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
