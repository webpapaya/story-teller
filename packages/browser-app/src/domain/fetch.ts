let authenticationToken: string

export const setAuthenticationToken = (token: string) => {
  authenticationToken = token
}

export const fetch = (
  url: string,
  request: RequestInit,
  options = { simulate: false }) => {
  return window.fetch(`${process.env.REACT_APP_SERVER_URL}/${url}`, {
    ...request,
    headers: {
      Authentication: authenticationToken,
      'Content-Type': 'application/json',
      ...request.headers,
      ...(options.simulate ? { 'x-story-teller-simulate': 'true' } : {})
    }
  })
}
