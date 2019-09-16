import React from 'react';
import { Provider } from 'react-redux'
import { BrowserRouter, Route } from 'react-router-dom'
import SignIn from './containers/user-sign-in';
import SignUp from './containers/user-sign-up'
import { store } from './domain';
import Page from './components/page';

const App = () => (
  <Provider store={store}>
    <BrowserRouter>
      <Route path="sign-in" component={SignIn} />
      <Route path="sign-up" component={SignUp} />
    </BrowserRouter>
  </Provider>

)

export default Page;
