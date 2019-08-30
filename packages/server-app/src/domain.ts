import { LocalDateTime } from "js-joda";

export type AuthenticationToken = {
  id: string,
  scope: string,
  createdAt: LocalDateTime,
}


export type UserAuthentication = {
  id: string,
  userIdentifier: string
  createdAt: LocalDateTime
  confirmationToken: string | null
  confirmedAt: LocalDateTime | null
  password: string
  passwordResetToken: string | null
  passwordResetCreatedAt: LocalDateTime | null,
  passwordChangedAt: LocalDateTime | null
}