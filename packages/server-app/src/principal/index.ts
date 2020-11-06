import { v } from '@story-teller/shared'
import { Request } from 'express'

export const principal = v.record({
  id: v.uuid,
  role: v.union([v.literal('user'), v.literal('manager')])
})

export const mapToPrincipal = (request: Request) => {
  const decoded = principal.decode(JSON.parse(request.headers.authorization ?? '{}'))
  if (decoded.isOk()) {
    return decoded.get()
  }
  throw new Error('unauthorized')
}