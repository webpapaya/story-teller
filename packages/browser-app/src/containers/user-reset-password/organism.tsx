import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { Button } from '../../components/button';
import { InputPassword } from '../../components/input-password';
import { Link } from '../../components/link';

const Organism = isForm({
  initialValues: {
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
      {...fields.password}
    />
    <InputPassword
      label="Password confirmation"
      {...fields.passwordConfirmation}
    />
    <Button block marginBottom>Submit</Button>
    <Link to="/" variant="link" block>
      Cancel
    </Link>
  </form>
))

export default Organism