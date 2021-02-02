import { UnpackThunk } from '../../domain/types'
import { renameCompany } from '../../domain/company/actions'
import { Company } from '../../domain/company/types'

export type OwnPropsType = {
  id: string
}
export type StatePropsType = {
  company?: Company
}

export type DispatchPropsType = {
  onSubmit: UnpackThunk<typeof renameCompany>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
