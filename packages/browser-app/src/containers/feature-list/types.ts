import { UnpackThunk } from '../../domain/types'
import { Feature } from '../../domain/feature/types'
import { whereFeature } from '../../domain/feature/actions'

export type OwnPropsType = {}
export type StatePropsType = {
  features: Feature[]
}

export type DispatchPropsType = {
  sideEffect: UnpackThunk<typeof whereFeature>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
