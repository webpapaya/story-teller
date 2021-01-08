import { History } from 'history'

export type OwnPropsType = {
  history: History
}

export type StatePropsType = {
}

export type DispatchPropsType = {
  sideEffect: () => Promise<any>
  onSignOut: () => void
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
