import express, { Request, Response, NextFunction } from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'
import { register, requestPasswordReset, resetPasswordByToken } from './authentication/use-cases'
import { withinConnection } from './lib/db'
import { sendMail } from './authentication/emails'
import { findUserByAuthentication, findUserByAuthenticationToken } from './authentication/queries'
import { UserAuthentication } from './domain'
import { Authentication } from '@story-teller/shared'
import { commandViaHTTP } from './command-via-http'
import { Result, Ok, Err } from 'space-lift'
import { Errors } from './errors'

const app = express()
const port = process.env.API_PORT

app.use(cookieParser(process.env.SECRET_KEY_BASE))
app.use(bodyParser())
app.use(cors({
  origin: (process.env.CORS_WHITELIST || '').split(','),
  credentials: true
}))




app.listen(port, () => console.log(`Example app listening on port ${port}!`))
