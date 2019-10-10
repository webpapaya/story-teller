import { UnpackThunk } from "../../domain/types";
import { getAuthenticatedUser } from "../../domain/authentication/actions";

export type OwnPropsType = { children: React.ReactNode };

export type StatePropsType = {};

export type DispatchPropsType = {
  sideEffect: UnpackThunk<typeof getAuthenticatedUser>
};

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
