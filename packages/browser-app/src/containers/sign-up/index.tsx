import React from 'react';
import isForm from '../../is-form';
import * as v from 'validation.ts'
import { InputText } from '../../components/input-text';
import { InputPassword } from '../../components/input-password';
import { Button } from '../../components/button';

const SignUp = isForm({
  defaultValues: {
    userIdentifier: '',
    password: '',
    passwordConfirmation: ''
  },
  validator: v.object({
    userIdentifier: v.string,
    password: v.string,
    passwordConfirmation: v.string,
  }),
}, ({ values, onValueChange }) => (
  <>
    <InputText
      name="userIdentifier"
      value={values.userIdentifier}
      onChange={onValueChange}
    />
    <InputPassword
      name="password"
      value={values.password}
      onChange={onValueChange}
    />
    <Button>Submit</Button>
  </>
))

export default SignUp