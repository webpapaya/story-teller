export type RepositoryError = 'NOT_FOUND'
export type HTTPError = 'UNAUTHORIZED'

export type Errors = RepositoryError | HTTPError

class DomainError extends Error {}
export class Unauthorized extends Error {}

type CodecErrors = Array<{
  message: string
  context: { path: string }
}>
export abstract class CodecError extends DomainError {
  abstract name: string
  constructor (public codecErrors: CodecErrors) {
    super()
  }
}

export class PrincipalDecodingError extends CodecError {
  name = 'couldn\'t decode principal'
}
export class AggregateInvalid extends CodecError {
  name = 'aggregate validation failed'
}
export class AggregateInvalidAfterUseCase extends AggregateInvalid {}
export class AggregateInvalidBeforeUseCase extends AggregateInvalid {}
export class EventInvalid extends CodecError {
  name = 'event validation failed'
}
export class CommandInvalid extends CodecError {
  name = 'command validation failed'
}
export class PreConditionViolated extends DomainError {}
export class PostConditionViolated extends DomainError {}

type UseCaseErrors =
  | 'Passwords do not match'
export class UseCaseError extends DomainError {
  constructor (public cause: UseCaseErrors) {
    super()
  }
}
