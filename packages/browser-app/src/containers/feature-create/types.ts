import { UnpackThunk } from '../../domain/types'
import { createFeature } from '../../domain/feature/actions'
import { History } from 'history'

export type OwnPropsType = {
  history: History
}
export type StatePropsType = {}

export type DispatchPropsType = {
  onSubmit: UnpackThunk<typeof createFeature>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
