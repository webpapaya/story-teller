import { store } from '.'

export const fetch = (
  url: string,
  request: Exclude<RequestInit, 'body'> & { rawBody?: Record<string, any> },
  options = { simulate: false }) => {
  const jwtToken = store.getState()?.authentication?.jwtToken

  return window.fetch(`${process.env.REACT_APP_SERVER_URL}/${url}`, {
    ...request,
    ...(request.rawBody ? { body: JSON.stringify(request.rawBody) } : {}),
    headers: {
      ...(jwtToken ? { authorization: jwtToken } : {}),
      'Content-Type': 'application/json',
      ...request.headers,
      ...(options.simulate ? { 'x-story-teller-simulate': 'true' } : {})
    }
  })
}
