import React from 'react';
import isForm from '../../is-form';
import * as v from 'validation.ts'
import { InputText } from '../../components/input-text';
import { InputPassword } from '../../components/input-password';
import { Button } from '../../components/button';
import { Link } from '../../components/link';

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
    <Button block marginBottom>Sign in</Button>
    <Link to="/sign-up" variant="link" block>
      Sign up
    </Link>
    <Link to="/request-password-reset" variant="link" block>
      Request password reset
    </Link>
  </form>
))

export default SignIn