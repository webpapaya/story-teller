import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { register, requestPasswordReset, resetPasswordByToken } from './authentication/commands'
import { withinConnection } from './lib/db'
import { sendMail } from './authentication/emails'
import { findUserByAuthentication, findUserByAuthenticationToken } from './authentication/queries'
import * as v from 'validation.ts'
import cors from 'cors'
import { createFeature } from './feature/commands'
import { Result, failure, UserAuthentication, success } from './domain'
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

type CommandViaHTTP = <A, B>(dependencies: B, args: {
  validator: v.Validator<A>,
  paramsWhitelist?: string[]
  useCase: (deps: B & { auth: Express.Request['auth'] }, value: A) => Promise<Result<unknown>>
}) => (req: Request, res: Response) => Promise<void>

const commandViaHTTP: CommandViaHTTP = (dependencies, { paramsWhitelist, validator, useCase }) => async (req, res) => {
  const result = await validator.validate({ ...req.body, ...req.query })
    .fold(
      () => failure({ isError: true, body: 'ValidationError' }),
      (v) => useCase({ ...dependencies, auth: req.auth }, v)
    )

  if (paramsWhitelist && result.isSuccess) {
    result.body = pick(paramsWhitelist, result.body)
  }

  return resultToHTTP(res, result)
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

app.get('/session', isAuthenticated, commandViaHTTP({}, {
  validator: v.object({}),
  useCase: async (dependencies) => success(dependencies.auth.user),
  paramsWhitelist: ['id', 'userIdentifier']
}))


app.post('/sign-up', commandViaHTTP({ withinConnection, sendMail }, {
  validator: v.object({
    userIdentifier: v.string,
    password: v.string
  }),
  useCase: register
}))

app.post('/request-password-reset', commandViaHTTP({ withinConnection, sendMail }, {
  validator: v.object({
    userIdentifier: v.string
  }),
  useCase: requestPasswordReset
}))

app.post('/reset-password-by-token', commandViaHTTP({ withinConnection }, {
  validator: v.object({
    userIdentifier: v.string,
    password: v.string,
    token: v.string
  }),
  useCase: resetPasswordByToken
}))

app.post('/sign-in', async (req, res) => {
  return withinConnection(async ({ client }) => {
    const user = await findUserByAuthentication({ client }, req.body)
    if (user) {
      res.cookie('session', JSON.stringify({ id: user.id, createdAt: new Date() }), { signed: true })
      res.sendStatus(200)
    } else {
      res.clearCookie('session')
      res.sendStatus(401)
    }
  })
})

app.post('/sign-out', async (req, res) => {
  res.clearCookie('session')
  res.sendStatus(200)
})

app.post('/feature', isAuthenticated, commandViaHTTP({ withinConnection }, {
  validator: v.object({
    id: v.string,
    title: v.string,
    description: v.string
  }),
  useCase: createFeature
}))

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
