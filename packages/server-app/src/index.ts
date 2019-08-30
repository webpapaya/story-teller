import express, { Request, Response, NextFunction } from 'express'

import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { register, requestPasswordReset, resetPasswordByToken, Result } from './authentication/commands'
import { withinConnection } from './lib/db'
import { sendMail } from './authentication/emails'
import { findUserByAuthentication, findUserByAuthenticationToken } from './authentication/queries'

const app = express()
const port = process.env.API_PORT

app.use(cookieParser(process.env.SECRET_KEY_BASE))
app.use(bodyParser())

const resultToHTTP = (res: Response, result: Result<unknown>) => {
  if (result.isSuccess) {
    res.send(result.body)
    res.status(200)
  } else {
    res.send(result.body)
    res.status(400)
  }
}



app.post('/sign-up', async (req, res) => {
  return resultToHTTP(res, await register({ withinConnection, sendMail }, {
    userIdentifier: req.body.userIdentifier,
    password: req.body.password
  }))
})

app.post('/request-password-reset', async (req, res) => {
  return resultToHTTP(res, await requestPasswordReset({ withinConnection, sendMail }, {
    userIdentifier: req.body.userIdentifier,
  }))
})

app.post('/reset-password-by-token', async (req, res) => {
  return resultToHTTP(res, await resetPasswordByToken({ withinConnection }, {
    userIdentifier: req.body.userIdentifier,
    newPassword: req.body.password,
    token: req.query.token
  }))
})

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

const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  await withinConnection(async ({ client }) => {
    const parsedCookie = JSON.parse(req.signedCookies.session || '{}')
    const user = findUserByAuthenticationToken({ client }, parsedCookie)
    if (!user) {
      res.sendStatus(401)
      next('Unauthorized')
    } else {
      next()
    }
  })
}

app.get('/session', isAuthenticated, (req, res) => {
  res.sendStatus(200)
})

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello World!!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
