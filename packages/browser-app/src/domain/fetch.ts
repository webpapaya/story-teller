import { store } from '.'

export const fetch = (
  url: string,
  request: RequestInit,
  options = { simulate: false }) => {
  const jwtToken = store.getState()?.authentication?.jwtToken

  return window.fetch(`${process.env.REACT_APP_SERVER_URL}/${url}`, {
    ...request,
    headers: {
      ...(jwtToken ? { Authentication: jwtToken } : {}),
      'Content-Type': 'application/json',
      ...request.headers,
      ...(options.simulate ? { 'x-story-teller-simulate': 'true' } : {})
    }
  })
}
