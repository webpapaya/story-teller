class ClientError extends Error {}
export class APIError extends ClientError {
  constructor (public details: any) {
    super()
  }

  get message () {
    return this.details.message
  }
}
