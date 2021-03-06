import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { InputText } from '../../components/input-text';
import { Button } from '../../components/button';
import { Link } from '../../components/link';
import { useTranslations } from './translations';

const Organism = isForm({
  initialValues: {
    userIdentifier: '',
  },
  schema: v.record({
    userIdentifier: v.string,
  }),
}, ({ fields, onSubmit }) => {
  const {t} = useTranslations()
  return (
  <form onSubmit={onSubmit} data-test-id="requestPasswordReset">
    <InputText
      label={t('email')}
      {...fields.userIdentifier}
    />
    <Button block marginBottom>Submit</Button>
    <Link to="/sign-in" variant="link" block>
      {t('signIn')}
    </Link>
    <Link to="/sign-up" variant="link" block>
      {t('signUp')}
    </Link>
  </form>
)
})

export default Organism