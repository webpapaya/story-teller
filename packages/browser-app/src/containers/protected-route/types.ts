import { UnpackThunk } from '../../domain/types'
import { getAuthenticatedUser } from '../../domain/authentication/actions'
import { RouteProps } from 'react-router-dom'

export type OwnPropsType = RouteProps
export type StatePropsType = {
  isAuthenticated: boolean
  isLoading: boolean
};

export type DispatchPropsType = {
  sideEffect: UnpackThunk<typeof getAuthenticatedUser>
};

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
