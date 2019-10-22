import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import { register, requestPasswordReset, resetPasswordByToken } from './authentication/commands'
import { withinConnection } from './lib/db'
import { sendMail } from './authentication/emails'
import { findUserByAuthentication, findUserByAuthenticationToken } from './authentication/queries'
import { createFeature, createFeatureRevision } from './feature/commands'
import { Result, failure, UserAuthentication, success } from './domain'
import {
  SESSION_COMMAND,
  SIGN_UP_COMMAND,
  REQUEST_PASSWORD_RESET_COMMAND,
  RESET_PASSWORD_BY_TOKEN_COMMAND,
  SIGN_IN_COMMAND,
  SIGN_OUT_COMMAND,
  CREATE_FEATURE_COMMAND,
  LIST_FEATURES_COMMAND,
  CREATE_FEATURE_REVISION_COMMAND,
  LIST_FEATURE_REVISIONS_COMMAND
} from '@story-teller/shared'
import { whereFeature, whereFeatureRevision } from './feature/queries'
import { commandViaHTTP } from './command-via-http'

const app = express()
const port = process.env.API_PORT


app.use(cookieParser(process.env.SECRET_KEY_BASE))
app.use(bodyParser())
app.use(cors({
  origin: (process.env.CORS_WHITELIST || '').split(','),
  credentials: true
}))

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

commandViaHTTP(SESSION_COMMAND, {
  app,
  middlewares: [isAuthenticated],
  dependencies: {},
  useCase: async (dependencies): Promise<Result<UserAuthentication>> =>
    success(dependencies.auth.user as UserAuthentication)
})

commandViaHTTP(SIGN_UP_COMMAND, {
  app,
  dependencies: { withinConnection, sendMail },
  useCase: register
})

commandViaHTTP(REQUEST_PASSWORD_RESET_COMMAND, {
  app,
  dependencies: { withinConnection, sendMail },
  useCase: requestPasswordReset
})

commandViaHTTP(RESET_PASSWORD_BY_TOKEN_COMMAND, {
  app,
  dependencies: { withinConnection },
  useCase: resetPasswordByToken
})

commandViaHTTP(SIGN_IN_COMMAND, {
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

commandViaHTTP(SIGN_OUT_COMMAND, {
  app,
  dependencies: {},
  useCase: async ({ res }) => {
    res.clearCookie('session')
    return success({})
  }
})

commandViaHTTP(CREATE_FEATURE_COMMAND, {
  app,
  dependencies: { withinConnection },
  useCase: createFeature
})


commandViaHTTP(CREATE_FEATURE_REVISION_COMMAND, {
  app,
  dependencies: { withinConnection },
  useCase: createFeatureRevision
})

commandViaHTTP(LIST_FEATURES_COMMAND, {
  app,
  dependencies: { withinConnection },
  useCase: whereFeature
})

commandViaHTTP(LIST_FEATURE_REVISIONS_COMMAND, {
  app,
  dependencies: { withinConnection },
  useCase: whereFeatureRevision
})



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
