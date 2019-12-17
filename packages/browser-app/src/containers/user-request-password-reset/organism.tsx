import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { InputText } from '../../components/input-text';
import { Button } from '../../components/button';
import { Link } from '../../components/link';

const Organism = isForm({
  defaultValues: {
    userIdentifier: '',
  },
  schema: v.record({
    userIdentifier: v.string,
  }),
}, ({ values, onValueChange, errors, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <InputText
      label="E-Mail"
      name="userIdentifier"
      error={errors.userIdentifier}
      value={values.userIdentifier}
      onChange={onValueChange}
    />
    <Button block marginBottom>Submit</Button>
    <Link to="/sign-in" variant="link" block>
      Sign in
    </Link>
    <Link to="/sign-up" variant="link" block>
      Sign up
    </Link>
  </form>
))

export default Organism