import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { InputText } from '../../components/input-text';
import { InputPassword } from '../../components/input-password';
import { Button } from '../../components/button';
import { Link } from '../../components/link';
import { useTranslations } from './translations';

const Organism = isForm({
  defaultValues: {
    userIdentifier: '',
    password: '',
    passwordConfirmation: ''
  },
  schema: v.record({
    userIdentifier: v.string,
    password: v.string,
    passwordConfirmation: v.string,
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
      <InputPassword
        label={t('passwordConfirmation')}
        name="passwordConfirmation"
        {...fields.passwordConfirmation}
      />
      <Button block marginBottom>{t('signUp')}</Button>

      <Link to="/sign-in" variant="link" block>
        {t('signIn')}
      </Link>
      <Link to="/request-password-reset" variant="link" block>
        {t('requestPasswordReset')}
      </Link>
    </form>
  )
})

export default Organism