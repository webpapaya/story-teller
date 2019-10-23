import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import { register, requestPasswordReset, resetPasswordByToken } from './authentication/commands'
import { withinConnection } from './lib/db'
import { sendMail } from './authentication/emails'
import { findUserByAuthentication, findUserByAuthenticationToken } from './authentication/queries'
import { createFeature, updateFeature } from './feature/commands'
import { UserAuthentication } from './domain'
import {
  Authentication,
  Revision,
  Feature
} from '@story-teller/shared'
import { whereFeature } from './feature/queries'
import { commandViaHTTP } from './command-via-http'
import { Result, Ok, Err } from 'space-lift'
import { HTTPError, Errors } from './errors'
import { whereRevision } from './revisions/queries'

const app = express()
const port = process.env.API_PORT


app.use(cookieParser(process.env.SECRET_KEY_BASE))
app.use(bodyParser())
app.use(cors({
  origin: (process.env.CORS_WHITELIST || '').split(','),
  credentials: true
}))

const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  const user = await withinConnection(async ({ client }) => {
    const parsedCookie = JSON.parse(req.signedCookies.session || '{}')
    return findUserByAuthenticationToken({ client }, parsedCookie)
  })

  if (user.isOk()) {
    req.auth = { user: user.get() }
    next()
  } else {
    res.status(401)
    res.send({})
    next(Err('UNAUTHORIZED'))
  }
}

commandViaHTTP(Authentication.queries.session, {
  app,
  middlewares: [isAuthenticated],
  dependencies: {},
  useCase: async (dependencies): Promise<Result<never, UserAuthentication>> =>
    Ok(dependencies.auth.user as UserAuthentication)
})

commandViaHTTP(Authentication.actions.signUp, {
  app,
  dependencies: { withinConnection, sendMail },
  useCase: register
})

commandViaHTTP(Authentication.actions.requestPasswordReset, {
  app,
  dependencies: { withinConnection, sendMail },
  useCase: requestPasswordReset
})

commandViaHTTP(Authentication.actions.resetPasswordByToken, {
  app,
  dependencies: { withinConnection },
  useCase: resetPasswordByToken
})

commandViaHTTP(Authentication.actions.signIn, {
  app,
  dependencies: { withinConnection },
  useCase: async ({ withinConnection, res }, args): Promise<Result<Errors, UserAuthentication>> => {
    return withinConnection(async ({ client }) => {
      const user = await findUserByAuthentication({ client }, args)
      if (user.isOk()) {
        res.cookie('session', JSON.stringify({ id: user.get().id, createdAt: new Date() }), { signed: true })
        return user
      } else {
        res.clearCookie('session')
        return Err<HTTPError>('UNAUTHORIZED')
      }
    })
  }
})

commandViaHTTP(Authentication.actions.signOut, {
  app,
  dependencies: {},
  useCase: async ({ res }) => {
    res.clearCookie('session')
    return Ok({})
  }
})

commandViaHTTP(Feature.actions.create, {
  app,
  dependencies: { withinConnection },
  useCase: createFeature
})

commandViaHTTP(Feature.actions.update, {
  app,
  dependencies: { withinConnection },
  useCase: updateFeature
})

commandViaHTTP(Feature.queries.where, {
  app,
  dependencies: { withinConnection },
  useCase: whereFeature
})

commandViaHTTP(Revision.queries.where, {
  app,
  dependencies: { withinConnection },
  useCase: whereRevision
})




app.listen(port, () => console.log(`Example app listening on port ${port}!`))
