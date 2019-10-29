declare module 'redux-memoize' {
  import { Middleware } from 'redux'
  type Options = {
    ttl: number
  }

  export default createMemoizeMiddleware = (options: Options) => Middleware

  export function memoize<T>(
    options: Options,
    action: T
  ): T

  export function memoize<T>(
    action: T
  ): T
}