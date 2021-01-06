import {
  CodecError,
  PostConditionViolated,
  PreConditionViolated,
  RepositoryError,
  Unauthorized,
  UseCaseError
} from '../../errors'
import { TokenExpiredError } from 'jsonwebtoken'

export const convertError = (error: Error) => {
  if (error instanceof CodecError) {
    return {
      status: 400,
      body: {
        description: error.name,
        payload: error.codecErrors
      }
    }
  } else if ([Unauthorized, PreConditionViolated, PostConditionViolated]
    .some((errorClass) => (error instanceof errorClass))) {
    return {
      status: 401,
      body: {
        message: 'Unauthorized'
      }
    }
  } else if (error instanceof UseCaseError) {
    return {
      status: 400,
      body: {
        description: 'Use case error',
        message: error.cause
      }
    }
  } else if (error instanceof PostConditionViolated) {
    return {
      status: 400,
      body: {
        description: 'postcondition violated',
        payload: []
      }
    }
  } else if (error instanceof RepositoryError &&
        error.cause === 'Record does already exist') {
    return {
      status: 409,
      body: {
        description: 'persistence error',
        message: error.cause
      }
    }
  } else if (error instanceof TokenExpiredError) {
    return {
      status: 401,
      body: {
        description: 'Token expired'
      }
    }
  } else {
    return {
      status: 500,
      body: {
        description: 'internal server error'
      }
    }
  }
}
