import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { InputText } from '../../components/input-text';
import { InputPassword } from '../../components/input-password';
import { Button } from '../../components/button';
import { Link } from '../../components/link';
import { useTranslations } from './translations';
import Message from '../../components/message';

const Organism = isForm({
  initialValues: {
    userIdentifier: '',
    password: '',
  },
  schema: v.record({
    userIdentifier: v.nonEmptyString,
    password: v.nonEmptyString,
  }),
}, ({ fields, onSubmit, submissionError }) => {
  const {t} = useTranslations()
  return (
    <form onSubmit={onSubmit}>
      <InputText
        label={t('userIdentifier')}
        {...fields.userIdentifier}
        error={fields.userIdentifier.error || (submissionError?.message)}
      />
      <InputPassword
        label={t('password')}
        {...fields.password}
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