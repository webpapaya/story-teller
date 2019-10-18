import * as v from 'validation.ts'
import { Result, failure, UserAuthentication } from './domain'
import { CommandDefinition } from '@story-teller/shared'
import { NextFunction, Request, Response } from 'express'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth: {
        user: UserAuthentication | null
      }
    }
  }
}

export const attributeFiltering = <A extends v.Validator<unknown>>(schema: A | undefined, value: any) => {
  if (!schema) { return value }
  return schema
    .validate(value)
    .fold(
      (e) => { throw e },
      (s) => s
    )
}

type ExecuteCommand = <A, B, C, D extends Result<unknown>>(definition: CommandDefinition<A, B>, args: {
  dependencies: C
  useCase: (deps: C & { auth: Express.Request['auth'] }, value: A) => D
}) => (params: any) => Promise<Result<unknown>>

export const executeCommand: ExecuteCommand = (definition, args) => async (params) => {
  const result = await definition.validator.validate(params).fold(
    (properties) => failure({ type: 'ValidationError', properties }),
    (v) => args.useCase({ ...args.dependencies, auth: params.auth }, v)
  )

  if (result.isSuccess) {
    result.body = attributeFiltering(definition.response, result.body)
  }

  return result
}

const resultToHTTP = (res: Response, result: Result<unknown>) => {
  if (result.isSuccess) {
    res.send(result.body)
    res.status(200)
  } else {
    res.send(result.body)
    res.status(400)
  }
}

type HTTPMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void> | void

type CommandViaHTTP = <A, B, C, D>(definition: CommandDefinition<A, B>, args: {
  app: any
  middlewares?: HTTPMiddleware[]
  dependencies: C
  useCase: (deps: C & { auth: Express.Request['auth'], res: Response }, value: A) => Promise<Result<D>>
}) => void

export const commandViaHTTP: CommandViaHTTP = (definition, { app, useCase, middlewares = [], dependencies }) => {
  const route = [
    definition.model,
    definition.action
  ].filter(x => x).join('/')

  app[definition.verb](`/${route}`, ...(middlewares || []), async (req: Request, res: Response) => {
    const result = await executeCommand(definition, {
      dependencies: { ...dependencies, res },
      // @ts-ignore
      useCase
    })({ ...req.body, ...req.query })

    return resultToHTTP(res, result)
  })
}
