export const fetch = (url: string, options: RequestInit) => {
  return window.fetch(`${process.env.REACT_APP_SERVER_URL}/${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
}
