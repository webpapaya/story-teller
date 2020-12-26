import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { Button } from '../../components/button';
import { InputPassword } from '../../components/input-password';
import { Link } from '../../components/link';
import { OrganismPropsType } from './types';
import { InputHidden } from '../../components/input-hidden';
import { useTranslations } from './translations'

const schema = v.record({
  id: v.string,
  token: v.string,
  password: v.string,
})

const Organism = isForm<typeof schema, OrganismPropsType>({
  initialValues: {
    id: '',
    token: '',
    password: '',
  },
  schema,
}, ({ fields, onSubmit }) => {
  const { t } = useTranslations()
  return (
  <form onSubmit={onSubmit} data-test-id="resetPasswordForm">
    <InputHidden
      defaultValue={fields.id.value}
      {...fields.id}
    />

    <InputHidden
      defaultValue={fields.token.value}
      {...fields.token}
    />

    <InputPassword
      label={t('password')}
      {...fields.password}
    />

    <Button block marginBottom>{t('submit')}</Button>
    <Link to="/" variant="link" block>
      {t('cancel')}
    </Link>
  </form>
)
})

export default Organism