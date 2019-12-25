import { Project } from '../../domain/project/types'

export type OwnPropsType = {}

export type StatePropsType = {
  projects: Project[]
}

export type DispatchPropsType = {
  sideEffect: () => Promise<void>
}

export type OrganismPropsType = StatePropsType & Omit<DispatchPropsType, 'sideEffect'>;
