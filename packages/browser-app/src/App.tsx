import React from 'react';

const onSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
  evt.preventDefault()
  console.log(evt.target)
}

const App: React.FC = () => {
  return (
    <form onSubmit={onSubmit}>
      <input type="text" name="username" />
      <input type="password" name="password" />
      <button type="submit">Submit</button>
    </form>
  );
}

export default App;
