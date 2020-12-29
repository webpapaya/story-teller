import { UnpackThunk } from '../../domain/types'
import { createCompany } from '../../domain/company/actions'

export type OwnPropsType = {}
export type StatePropsType = {}

export type DispatchPropsType = {
  onSubmit: UnpackThunk<typeof createCompany>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
