import * as useCases from './use-cases-connected'
import { exposeUseCaseViaHTTP } from '../lib/use-case-via-http'
import { IRouter } from 'express'
import { v } from '@story-teller/shared'
import './use-cases-reactions'

export const initialize = (app: IRouter) => {
  app.post('/authentication/sign-in', async (req, res) => {
    const signInResponse = await useCases.signIn.execute(req.body)
    if (signInResponse.refreshToken.token.state === 'active') {
      res.cookie('refreshToken', signInResponse.refreshToken.token.plainToken, {
        // TODO: enable expiration
        // expires: new Date(signInResponse.refreshToken.expiresOn.toString()),
        httpOnly: true,
        signed: true
      })
    }

    res.send({
      payload: {
        jwtToken: signInResponse.jwtToken
      }
    })
  })

  exposeUseCaseViaHTTP({
    app,
    actionName: 'sign-up',
    aggregateName: 'authentication',
    useCase: useCases.register,
    method: 'post',
    principal: v.undefinedCodec,
    authenticateBefore: () => true,
    mapToPrincipal: () => undefined,
    mapToCommand: ({ request }) => {
      return request.body
    }
  })
  return app
}
