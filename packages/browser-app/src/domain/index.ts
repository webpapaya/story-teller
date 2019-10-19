import { combineReducers, createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import authenticationReducer from './authentication/reducer'
import featureReducer from './feature/reducer'
import createHTTPInstance from '../utils/create-http-connection'

export const rootReducer = combineReducers({
  authentication: authenticationReducer,
  features: featureReducer
})

export const store = createStore(rootReducer, composeWithDevTools(
  applyMiddleware(ReduxThunk.withExtraArgument({
    http: createHTTPInstance({ baseURL: process.env.REACT_APP_SERVER_URL as string })
  }))
))
