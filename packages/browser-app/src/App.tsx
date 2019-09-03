import React from 'react';
import SignIn from './containers/sign-in';



const App: React.FC = () => {
  return (<SignIn onSubmit={(values) => console.log(values)} />);
}

export default App;
