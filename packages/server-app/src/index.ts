import express from 'express'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import cors from 'cors'

import * as vacation from './vacation/use-cases-via-http'
import * as invitation from './invitations/use-cases-via-http'
import * as company from './company/use-cases-via-http'

const app = express()
const port = process.env.API_PORT

app.use(cookieParser(process.env.SECRET_KEY_BASE))
app.use(bodyParser.json())
app.use(cors({
  origin: (process.env.CORS_WHITELIST ?? '').split(','),
  credentials: true
}))

vacation.initialize(app)
invitation.initialize(app)
company.initialize(app)

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
