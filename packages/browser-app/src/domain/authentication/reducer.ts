type AuthenticatedUser = {
  id: string
  email: string
}

const initialState: AuthenticatedUser[] = []

const reducer = (state = initialState) => {
  return state
}

export default reducer
