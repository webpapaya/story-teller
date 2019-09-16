import React from 'react';

const Editor = React.lazy(()=> import('./editor'))

type InputTextareaProps = {
  value?: string,
  onChange?: (value: string) => void,
  leftNavigation?: JSX.Element,
}


export default (props: InputTextareaProps) => (
  <React.Suspense fallback={<div>Loading...</div>}>
      <Editor {...props} />
  </React.Suspense>
)