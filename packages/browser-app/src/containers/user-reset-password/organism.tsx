import React from 'react';
import isForm from '../../is-form';
import * as v from 'validation.ts'
import { InputText } from '../../components/input-text';
import { Button } from '../../components/button';
import { InputPassword } from '../../components/input-password';

const Organism = isForm({
  defaultValues: {
    password: '',
    passwordConfirmation: '',
  },
  schema: v.object({
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
    <Button block>Submit</Button>
  </form>
))

export default Organism