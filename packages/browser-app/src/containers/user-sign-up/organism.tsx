import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { InputText } from '../../components/input-text';
import { InputPassword } from '../../components/input-password';
import { Button } from '../../components/button';
import { Link } from '../../components/link';


const Organism = isForm({
  defaultValues: {
    userIdentifier: '',
    password: '',
    passwordConfirmation: ''
  },
  schema: v.object({
    userIdentifier: v.string,
    password: v.string,
    passwordConfirmation: v.string,
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
    <InputPassword
      label="Password Confirmation"
      name="passwordConfirmation"
      value={values.passwordConfirmation}
      onChange={onValueChange}
    />
    <Button block marginBottom>Sign up</Button>

    <Link to="/sign-in" variant="link" block>
      Sign in
    </Link>
    <Link to="/request-password-reset" variant="link" block>
      Request password reset
    </Link>
  </form>
))

export default Organism