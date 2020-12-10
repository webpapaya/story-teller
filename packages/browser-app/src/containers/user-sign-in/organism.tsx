import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { InputText } from '../../components/input-text';
import { InputPassword } from '../../components/input-password';
import { Button } from '../../components/button';
import { Link } from '../../components/link';
import { useTranslations } from './translations';

const SignIn = isForm({
  initialValues: {
    userIdentifier: '',
    password: ''
  },
  schema: v.record({
    userIdentifier: v.string,
    password: v.string,
  }),
}, ({ fields, onSubmit }) => {
  const {t} = useTranslations()
  return (
  <form onSubmit={onSubmit}>
    <InputText
      label={t('userIdentifier')}
      name="userIdentifier"
      {...fields.userIdentifier}
    />
    <InputPassword
      label={t('password')}
      name="password"
      {...fields.password}
    />
    <Button block marginBottom>Sign in</Button>
    <Link to="/sign-up" variant="link" block>
      {t('signUp')}
    </Link>
    <Link to="/request-password-reset" variant="link" block>
      {t('requestPasswordReset')}
    </Link>
  </form>
)})

export default SignIn