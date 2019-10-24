import { History } from 'history';
import { Revision } from '../../domain/revision/types';

export type OwnPropsType = {
  id: string,
};

export type StatePropsType = {
  revision: Revision[]
};

export type DispatchPropsType = {
  sideEffect: () => Promise<void>
};

export type OrganismPropsType = StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
