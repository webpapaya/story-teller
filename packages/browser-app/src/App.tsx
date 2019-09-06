import React from 'react';
import { Provider } from 'react-redux'
import SignIn from './containers/user-sign-in';
import { store } from './domain';

const App = () => (
  <Provider store={store}>
    <SignIn />
  </Provider>
)

export default App;
