/* eslint-disable-all */
declare module 'redux-memoize' {
  import { Middleware } from 'redux'
  type Options = {
    ttl: number
    cache?: any
  }

  export default function createMemoizeMiddleware(options: Options): Middleware
  export function memoize<T>(options: Options, action: T): T & { unmemoized: T }
  export function memoize<T>(action: T): T & { unmemoized: T }
}
