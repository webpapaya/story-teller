import React from 'react';
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { store } from './domain';

import SignIn from './containers/user-sign-in';
import SignUp from './containers/user-sign-up'
import RequestPasswordReset from './containers/user-request-password-reset'
import FeatureCreate from './containers/feature-create'
import FeatureList from './containers/feature-list'
import FeatureUpdate from './containers/feature-create-revision'
import FeatureRevisionList from './containers/feature-revision-list'
import FeatureSetTags from './containers/feature-set-tags'

import ProtectedRoute from './containers/protected-route';
import Navigation from './containers/navigation';
import CenteredPanel from './components/centered-panel';


const App = () => (
  <BrowserRouter>
    <Provider store={store}>
        <ProtectedRoute path='*' component={Navigation} />
        <Switch>
          <Route
            path="/sign-up"
            render={({ history }) => (
              <CenteredPanel>
                <SignUp history={history} />
              </CenteredPanel>
            )}
          />
          <Route
            path="/sign-in"
            render={({ history }) => (
              <CenteredPanel>
                <SignIn history={history} />
              </CenteredPanel>
            )}
          />
          <Route
            path="/request-password-reset"
            render={({ history }) => (
              <CenteredPanel>
                <RequestPasswordReset history={history} />
              </CenteredPanel>
            )}
          />
          <ProtectedRoute path='/feature/create' component={FeatureCreate} />
          <ProtectedRoute path='/feature/:id' component={(props: any) => (
            <>
              <FeatureSetTags featureId={props.match.params.id} />
              <FeatureUpdate id={props.match.params.id} history={props.history} />
              <FeatureRevisionList id={props.match.params.id} />
            </>
          )} />
          <ProtectedRoute path='/' component={FeatureList} />
        </Switch>
    </Provider>
  </BrowserRouter>
)

export default App
