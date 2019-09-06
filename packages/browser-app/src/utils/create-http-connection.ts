const joinURL = (...parts: string[]) =>
  parts.join('/').replace(/([^:]\/)\/+/g, '$1')

const createHTTPInstance = (options: { baseURL: string }) => {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    mode: 'cors'
  }

  console.log(joinURL(options.baseURL, '/test'))

  return {
    get: (path: string) => window.fetch(joinURL(options.baseURL, path), {
      ...defaultOptions,
      method: 'GET'
    }),
    post: (path: string, body: object) => window.fetch(joinURL(options.baseURL, path), {
      ...defaultOptions,
      method: 'POST',
      body: JSON.stringify(body)
    }),
    patch: (path: string, body: object) => window.fetch(joinURL(options.baseURL, path), {
      ...defaultOptions,
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
    put: (path: string, body: object) => window.fetch(joinURL(options.baseURL, path), {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify(body)
    }),
    delete: (path: string, body: object) => window.fetch(joinURL(options.baseURL, path), {
      ...defaultOptions,
      method: 'DELETE',
      body: JSON.stringify(body)
    })
  }
}

export default createHTTPInstance
