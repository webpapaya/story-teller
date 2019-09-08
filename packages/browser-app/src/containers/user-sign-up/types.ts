import { UnpackThunk } from '../../domain/types'
import { signUp } from '../../domain/authentication/actions'

export type OwnPropsType = {};
export type StatePropsType = {};

export type DispatchPropsType = {
  onSubmit: UnpackThunk<typeof signUp>
};

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
