import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { Button } from '../../components/button';
import { InputPassword } from '../../components/input-password';
import { Link } from '../../components/link';

const Organism = isForm({
  defaultValues: {
    password: '',
    passwordConfirmation: '',
  },
  schema: v.record({
    password: v.string,
    passwordConfirmation: v.string,
  }),
}, ({ values, onValueChange, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <InputPassword
      label="New password"
      name="password"
      value={values.password}
      onChange={onValueChange}
    />
    <InputPassword
      label="Password confirmation"
      name="passwordConfirmation"
      value={values.passwordConfirmation}
      onChange={onValueChange}
    />
    <Button block marginBottom>Submit</Button>
    <Link to="/" variant="link" block>
      Cancel
    </Link>
  </form>
))

export default Organism