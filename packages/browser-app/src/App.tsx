import React from 'react';
import { Provider } from 'react-redux'
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom'
import { store } from './domain';

import SignIn from './containers/user-sign-in';
import SignUp from './containers/user-sign-up'
import FeatureCreate from './containers/feature-create/organism'
import ProtectedRoute from './containers/protected-route';

const App = () => (
  <BrowserRouter>
    <Provider store={store}>
        <Switch>
          <ProtectedRoute path='/' component={FeatureCreate} />

          <Route path="/sign-up" component={SignUp} />
          <Route path="/sign-in" component={SignIn} />
          <Redirect to="/sign-in" exact />
        </Switch>
    </Provider>
  </BrowserRouter>
)

export default App
