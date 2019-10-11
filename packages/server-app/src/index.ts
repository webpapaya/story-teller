import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { register, requestPasswordReset, resetPasswordByToken } from './authentication/commands'
import { withinConnection } from './lib/db'
import { sendMail } from './authentication/emails'
import { findUserByAuthentication, findUserByAuthenticationToken } from './authentication/queries'
import cors from 'cors'
import { createFeature } from './feature/commands'
import { Result, failure, UserAuthentication, success } from './domain'
import { SESSION_DEFINITION, SIGN_UP_DEFINITION, REQUEST_PASSWORD_RESET_DEFINITION, RESET_PASSWORD_BY_TOKEN_DEFINITION, SIGN_IN_DEFINITION, SIGN_OUT_DEFINITION, CREATE_FEATURE_DEFINITION, CommandDefinition } from '@story-teller/shared'

const app = express()
const port = process.env.API_PORT

declare global {
  namespace Express {
    interface Request {
      auth: {
        user: UserAuthentication | null
      }
    }
  }
}

app.use(cookieParser(process.env.SECRET_KEY_BASE))
app.use(bodyParser())
app.use(cors({
  origin: (process.env.CORS_WHITELIST || '').split(','),
  credentials: true
}))

const pick = (props: string[], object: any) => props.reduce((filtered, key) => {
  // @ts-ignore
  if (object[key]) {
    // @ts-ignore
    filtered[key] = object[key]
  }
  return filtered;
}, {})


type HTTPMiddleware = (req: Request, res: Response, next: NextFunction) => Promise<void> | void
type CommandViaHTTP = <A, B, C>(definition: CommandDefinition<A>, args: {
  app: any,
  dependencies: B,
  middlewares?: HTTPMiddleware[]
  useCase: (deps: B & { auth: Express.Request['auth'], res: Response }, value: A) => Promise<Result<C>>
}) => void

const commandViaHTTP: CommandViaHTTP = ({ validator, response, ...http }, { app, useCase, middlewares = [], dependencies }) => {
  app[http.verb](http.name, ...(middlewares || []), async (req: Request, res: Response) => {
    const result = await validator.validate({ ...req.body, ...req.query })
    .fold(
      () => failure({ isError: true, body: 'ValidationError' }),
      (v) => useCase({ ...dependencies, auth: req.auth, res }, v)
    )

    if (response && result.isSuccess) {
      // @ts-ignore
      result.body = pick(Object.keys(response.props), result.body)
    }

    return resultToHTTP(res, result)
  })
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

const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  await withinConnection(async ({ client }) => {
    const parsedCookie = JSON.parse(req.signedCookies.session || '{}')
    const user = await findUserByAuthenticationToken({ client }, parsedCookie)
    if (!user) {
      res.sendStatus(401)
      next('Unauthorized')
    } else {
      req.auth = { user }
      next()
    }
  })
}

commandViaHTTP(SESSION_DEFINITION, {
  app,
  middlewares: [isAuthenticated],
  dependencies: {},
  useCase: async (dependencies): Promise<Result<UserAuthentication>> =>
    success(dependencies.auth.user as UserAuthentication)
})

commandViaHTTP(SIGN_UP_DEFINITION, {
  app,
  dependencies: { withinConnection, sendMail },
  useCase: register
})

commandViaHTTP(REQUEST_PASSWORD_RESET_DEFINITION, {
  app,
  dependencies: { withinConnection, sendMail },
  useCase: requestPasswordReset
})

commandViaHTTP(RESET_PASSWORD_BY_TOKEN_DEFINITION, {
  app,
  dependencies: { withinConnection, sendMail },
  useCase: resetPasswordByToken
})

commandViaHTTP(SIGN_IN_DEFINITION, {
  app,
  dependencies: { withinConnection },
  useCase: async ({ withinConnection, res }, args): Promise<Result<any>> => {
    return withinConnection(async ({ client }) => {
      const user = await findUserByAuthentication({ client }, args)
      if (user) {
        res.cookie('session', JSON.stringify({ id: user.id, createdAt: new Date() }), { signed: true })
        return success(user)
      } else {
        res.clearCookie('session')
        return failure('unauthorized')
      }
    })
  }
})

commandViaHTTP(SIGN_OUT_DEFINITION, {
  app,
  dependencies: {},
  useCase: async ({ res }) => {
    res.clearCookie('session')
    return success('OK')
  }
})

commandViaHTTP(CREATE_FEATURE_DEFINITION, {
  app,
  dependencies: { withinConnection },
  useCase: createFeature
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
