import { combineReducers, createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import createMemoizeMiddleware from 'redux-memoize'
import { composeWithDevTools } from 'redux-devtools-extension'
import authenticationReducer from './authentication/reducer'
import createHTTPInstance from '../utils/create-http-connection'
import { cache } from './cache'

export const rootReducer = combineReducers({
  authentication: authenticationReducer
})

export const store = createStore(rootReducer, composeWithDevTools(
  applyMiddleware(
    createMemoizeMiddleware({ ttl: 999999, cache }),
    ReduxThunk.withExtraArgument({
      http: createHTTPInstance({ baseURL: process.env.REACT_APP_SERVER_URL as string })
    }))
))
