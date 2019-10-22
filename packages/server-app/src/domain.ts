import { LocalDateTime } from 'js-joda'

type UUID = string

export type AuthenticationToken = {
  id: UUID
  scope: string
  createdAt: LocalDateTime
}

export type UserAuthentication = {
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

export type Feature = {
  id: UUID
  title: string
  description: string
}
