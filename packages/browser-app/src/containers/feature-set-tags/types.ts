import { UnpackThunk } from '../../domain/types'
import { Tag, Feature } from '../../domain/feature/types'
import { setTags } from '../../domain/feature/actions'

export type OwnPropsType = {
  featureId: string
}

export type StatePropsType = {
  tags: Tag[]
  feature: Feature
}

export type DispatchPropsType = {
  sideEffect: () => Promise<void>
  onSubmit: UnpackThunk<typeof setTags>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
