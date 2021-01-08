import qs from 'qs'
import { fetch } from '../domain/fetch'

const joinURL = (...parts: string[]) =>
  parts
    .join('/')
    .replace(/([^:]\/)\/+/g, '$1')
    .replace(/\?$/, '')
    .replace('/?', '?')

const parseResponse = (res: Response) => {
  if (res.status < 400) {
    return res
  } else {
    throw res
  }
}

const createHTTPInstance = (options: { baseURL: string }) => {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    headers: { 'content-type': 'application/json' },
    mode: 'cors'
  }

  return {
    get: (path: string, params: unknown = {}) => fetch(joinURL(options.baseURL, path, `?${qs.stringify(params)}`), {
      ...defaultOptions,
      method: 'GET'
    }).then(parseResponse),
    post: (path: string, body: unknown) => {
      return fetch(joinURL(options.baseURL, path), {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(body)
      }).then(parseResponse)
    },
    patch: (path: string, body: unknown) => fetch(joinURL(options.baseURL, path), {
      ...defaultOptions,
      method: 'PATCH',
      body: JSON.stringify(body)
    }).then(parseResponse),
    put: (path: string, body: unknown) => fetch(joinURL(options.baseURL, path), {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify(body)
    }).then(parseResponse),
    delete: (path: string, body: unknown) => fetch(joinURL(options.baseURL, path), {
      ...defaultOptions,
      method: 'DELETE',
      body: JSON.stringify(body)
    }).then(parseResponse)
  }
}

export default createHTTPInstance
