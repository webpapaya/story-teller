import { principal } from './domain'
import { Request } from 'express'
import jsonwebtoken from 'jsonwebtoken'

export const mapToPrincipal = (request: Request) => {
  return mapToFastifyPrincipal(request.headers.authorization ?? '')
}

export const mapToFastifyPrincipal = (header: string) => {
  const token = (header ?? '').replace('Bearer ', '')
  const secret = process.env.SECRET_KEY_BASE ?? ''
  const decoded = principal.decode(jsonwebtoken.verify(token, secret))

  if (decoded.isOk()) {
    return decoded.get()
  }
  throw new Error('unauthorized')
}

export { principal, Principal } from './domain'
