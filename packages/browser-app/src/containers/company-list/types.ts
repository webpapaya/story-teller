
import { UnpackThunk } from '../../domain/types'
import { whereCompanies } from '../../domain/company/actions'
import { Company } from '../../domain/company/types'

export type OwnPropsType = {}
export type StatePropsType = {
  companies: Company[]
}

export type DispatchPropsType = {
  sideEffect: UnpackThunk<typeof whereCompanies>
}

export type OrganismPropsType = OwnPropsType & StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
