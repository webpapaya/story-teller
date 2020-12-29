export type Errors = any

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

abstract class HTTPCodecError extends CodecError {}
export class InputInvalid extends HTTPCodecError {
  name = 'input validation failed'
}
export class ResponseInvalid extends HTTPCodecError {
  name = 'response validation failed'
}

export class PreConditionViolated extends DomainError {}
export class PostConditionViolated extends DomainError {}

export type RepositoryErrors =
  | 'Record does already exist'
  | 'Record not found'
  | 'Unknown'

export class RepositoryError extends DomainError {
  constructor (public cause: RepositoryErrors) {
    super()
  }
}

type UseCaseErrors =
  | 'Token is invalid'
  | 'Password did not match'
  | 'Token did not match'
  | 'Token is to old'
  | 'Token needs to be active'

export class UseCaseError extends DomainError {
  constructor (public cause: UseCaseErrors) {
    super()
  }
}

export class ReactionError extends DomainError {
  constructor (public cause: UseCaseErrors) {
    super()
  }
}
