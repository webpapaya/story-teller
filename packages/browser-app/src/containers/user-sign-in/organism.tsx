import React from 'react';
import isForm from '../../is-form';
import * as v from 'validation.ts'
import { InputText } from '../../components/input-text';
import { InputPassword } from '../../components/input-password';
import { Button } from '../../components/button';

const SignIn = isForm({
  defaultValues: {
    userIdentifier: '',
    password: ''
  },
  schema: v.object({
    userIdentifier: v.string,
    password: v.string,
  }),
}, ({ values, onValueChange, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <InputText
      label="E-Mail/Username"
      name="userIdentifier"
      value={values.userIdentifier}
      onChange={onValueChange}
    />
    <InputPassword
      label="Password"
      name="password"
      value={values.password}
      onChange={onValueChange}
    />
    <Button block>Submit</Button>
  </form>
))

export default SignIn