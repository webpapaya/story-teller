import { UnpackThunk } from '../../domain/types'
import { signOut } from '../../domain/authentication/actions'

export type OwnPropsType = {};
export type StatePropsType = {};

export type DispatchPropsType = {
  onSignOut: UnpackThunk<typeof signOut>
};

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
