import { combineReducers, createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import createMemoizeMiddleware from 'redux-memoize'
import { composeWithDevTools } from 'redux-devtools-extension'
import authenticationReducer from './authentication/reducer'
import featureReducer from './feature/reducer'
import revisionReducer from './revision/reducer'
import projectReducer from './project/reducer'
import tagReducer from './tags/reducer'
import createHTTPInstance from '../utils/create-http-connection'
import { cache } from './cache'

export const rootReducer = combineReducers({
  authentication: authenticationReducer,
  features: featureReducer,
  revisions: revisionReducer,
  tags: tagReducer,
  projects: projectReducer
})

export const store = createStore(rootReducer, composeWithDevTools(
  applyMiddleware(
    createMemoizeMiddleware({ ttl: 999999, cache }),
    ReduxThunk.withExtraArgument({
      http: createHTTPInstance({ baseURL: process.env.REACT_APP_SERVER_URL as string })
    }))
))
