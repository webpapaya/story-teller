import express, { Request, Response, NextFunction } from 'express'

import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import { findUserByAuthentication, register, findUserById } from './authentication'
import { withinConnection } from './lib/db'
import { sendMail } from './authentication/emails'

const app = express()
const port = process.env.API_PORT

app.use(cookieParser(process.env.SECRET_KEY_BASE))
app.use(bodyParser())

app.post('/sign-up', async (req, res) => {
  await register({ withinConnection, sendMail }, {
    userIdentifier: req.body.userIdentifier,
    password: req.body.password
  })
  res.send('Ok')
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
  const parsedCookie = JSON.parse(req.signedCookies.session || '{}')
  const user = await withinConnection(async ({ client }) => {
    return findUserById({ client }, { id: parsedCookie.id })
  })

  if (!user) {
    res.sendStatus(401)
    next('Unauthorized')
  } else {
    next()
  }
}

app.get('/session', isAuthenticated, (req, res) => {
  res.sendStatus(200)
})

app.get('/', (req: express.Request, res: express.Response) => {
  console.log(req.body)
  res.send('Hello World!!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
