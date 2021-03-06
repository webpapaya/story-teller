import fastify from 'fastify'
import fastifyCookie from 'fastify-cookie'
import fastifyCors from 'fastify-cors'
import * as authentication from './authentication/use-cases-via-http'
import * as company from './company/use-cases-via-http'

const app = fastify({
  logger: true
})

app.register(fastifyCookie, {
  secret: process.env.SECRET_KEY_BASE
})
app.register(fastifyCors, {
  origin: (process.env.CORS_WHITELIST ?? '').split(','),
  credentials: true
})

const port = parseInt(process.env.API_PORT ?? '3000')

Object.values(authentication).forEach((endpoint) => {
  endpoint.register(app)
})

Object.values(company).forEach((endpoint) => {
  endpoint.register(app)
})

app.listen(port)
