import * as v from 'validation.ts'
import { UserAuthentication } from './domain'
import { CommandDefinition } from '@story-teller/shared'
import { NextFunction, Request, Response } from 'express'
import { Result, Err, Ok } from 'space-lift'

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
      (e) => {
        console.error(e)
        throw e;
       },
      (s) => s
    )
}

type ExecuteCommand = <A, B, C, D extends Result<unknown, unknown>>(definition: CommandDefinition<A, B>, args: {
  dependencies: C
  auth: Express.Request['auth'],
  useCase: (deps: C & { auth: Express.Request['auth'] }, value: A) => D
}) => (params: any) => Promise<Result<unknown, unknown>>

export const executeCommand: ExecuteCommand = (definition, args) => async (params) => {
  const result = await definition.validator.validate(params).fold(
    (properties) => Err({ type: 'ValidationError', properties }),
    (v) => args.useCase({ ...args.dependencies, auth: args.auth }, v)
  )

  if (result.isOk()) {
    return Ok(attributeFiltering(definition.response, result.get()))
  }

  return result
}

const resultToHTTP = (res: Response, result: Result<unknown, unknown>) => {
  if (result.isOk()) {
    res.status(200)
    res.send(result.get())
  } else if (result.get() === 'NOT_FOUND') {
    res.status(404)
    res.send({})
  } else {
    res.status(400)
    res.send(result.get())
  }
}

type HTTPMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void> | void

type CommandViaHTTP = <A, B, C, D>(definition: CommandDefinition<A, B>, args: {
  app: any
  middlewares?: HTTPMiddleware[]
  dependencies: C
  useCase: (deps: C & { auth: Express.Request['auth'], res: Response }, value: A) => Promise<Result<unknown, D>>
}) => void

export const commandViaHTTP: CommandViaHTTP = (definition, { app, useCase, middlewares = [], dependencies }) => {
  const route = [
    definition.model,
    definition.action
  ].filter(x => x).join('/')

  app[definition.verb](`/${route}`, ...(middlewares || []), async (req: Request, res: Response) => {
    const command = await executeCommand(definition, {
      dependencies: { ...dependencies, res },
      auth: req.auth,
      // @ts-ignore
      useCase
    })

    try {
      return resultToHTTP(res, await command({ ...req.body, ...req.query }))
    } catch (e) {
      return resultToHTTP(res, Err(e))
    }
  })
}
