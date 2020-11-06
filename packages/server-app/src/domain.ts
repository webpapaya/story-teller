import { LocalDateTime } from 'js-joda'
import { v, Revision, Project as DomainProject } from '@story-teller/shared'
import { Request } from 'express'

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

export const requestingUser = v.record({
  id: v.uuid,
  role: v.union([v.literal('user'), v.literal('manager')])
})

export const mapToRequestingUser = (request: Request) => {
  const decoded = requestingUser.decode(JSON.parse(request.headers.authorization ?? '{}'))
  if (decoded.isOk()) {
    return decoded.get()
  }
  throw new Error('unauthorized')
}
