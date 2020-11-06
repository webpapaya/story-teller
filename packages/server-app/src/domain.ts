import { LocalDateTime } from 'js-joda'
import { Revision, Project as DomainProject } from '@story-teller/shared'

type UUID = string

export interface AuthenticationToken {
  id: UUID
  scope: string
  createdAt: LocalDateTime
}

export interface UserAuthentication {
  id: UUID
  userIdentifier: string
  createdAt: LocalDateTime
  confirmationToken: string | null
  confirmedAt: LocalDateTime | null
  password: string
  passwordResetToken: string | null
  passwordResetCreatedAt: LocalDateTime | null
  passwordChangedAt: LocalDateTime | null
}

export interface Feature {
  id: UUID
  title: string
  description: string
}

export interface Tag {
  id: UUID
  name: string
  color: string
}

export type FeatureRevision = typeof Revision.aggregate['O']
export type Project = typeof DomainProject.aggregate['O']
export interface Contributor {
  userId: string
  projectId: string
  name: string
}
