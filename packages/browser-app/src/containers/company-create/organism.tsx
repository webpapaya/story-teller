import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { Button } from '../../components/button';
import { useTranslations } from './translations';
import Heading from '../../components/heading';
import { InputText } from '../../components/input-text';

const CreateCompany = isForm({
  initialValues: {
    name: '',

  },
  schema: v.record({
    name: v.nonEmptyString,
  }),
}, ({ fields, onSubmit }) => {
  const {t} = useTranslations()

  return (
    <form onSubmit={onSubmit} data-test-id="createCompanyForm">
      <Heading alignment='center' variant='h2'>{t('heading')}</Heading>
      <InputText
        label={t('name')}
        {...fields.name}
      />
      <Button block marginBottom>{t('createCompany')}</Button>
    </form>
)})

export default CreateCompany