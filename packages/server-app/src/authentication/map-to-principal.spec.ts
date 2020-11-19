import { Request } from 'express'
import { assertThat, equalTo, throws } from 'hamjest'
import jsonwebtoken from 'jsonwebtoken'
import { v4 } from 'uuid'
import { mapToPrincipal } from './map-to-principal'

describe('mapToPrincipal', () => {
  it('WHEN token was signed correctly, decodes a bearer token', () => {
    const principal = { id: v4(), employedIn: [] }
    const secretKeyBase = process.env.SECRET_KEY_BASE ?? ''
    const jwtToken = 'Bearer ' + jsonwebtoken.sign(principal, secretKeyBase)
    const request = { headers: { authorization: jwtToken } } as unknown as Request

    assertThat(mapToPrincipal(request), equalTo(principal))
  })

  it('WHEN token was signed with a different key, throws Unauthorized', () => {
    const principal = { id: v4(), employedIn: [] }
    const secretKeyBase = 'some different secret'
    const jwtToken = 'Bearer ' + jsonwebtoken.sign(principal, secretKeyBase)
    const request = { headers: { authorization: jwtToken } } as unknown as Request

    assertThat(() => mapToPrincipal(request), throws())
  })

  it('WHEN principal does not match, throws Unauthorized', () => {
    const principal = { whatever: 'principal' }
    const secretKeyBase = 'some different secret'
    const jwtToken = 'Bearer: ' + jsonwebtoken.sign(principal, secretKeyBase)
    const request = { headers: { authorization: jwtToken } } as unknown as Request

    assertThat(() => mapToPrincipal(request), throws())
  })
})
