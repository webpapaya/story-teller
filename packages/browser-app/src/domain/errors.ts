class ClientError extends Error {}
export class APIError extends ClientError {
  constructor (public message: any) {
    super()
  }
}
