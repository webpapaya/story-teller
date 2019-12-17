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
}, ({ fields, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <InputPassword
      label="New password"
      name="password"
      {...fields.password}
    />
    <InputPassword
      label="Password confirmation"
      name="passwordConfirmation"
      {...fields.passwordConfirmation}
    />
    <Button block marginBottom>Submit</Button>
    <Link to="/" variant="link" block>
      Cancel
    </Link>
  </form>
))

export default Organism