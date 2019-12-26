import React from 'react';
import {v} from '@story-teller/shared'
import uuid from 'uuid'
import isForm from '../../is-form';
import { InputText } from '../../components/input-text';
import { Button } from '../../components/button';
import { OrganismPropsType } from './types';
import styles from './organism.module.css'
import { InputHidden } from '../../components/input-hidden';
import { useTranslations } from './translations';

const Organism = isForm<any, OrganismPropsType>({
  defaultValues: {
    id: '',
    title: '',
    description: ''
  },
  schema: v.record({
    id: v.uuid,
    title: v.nonEmptyString,
    description: v.nonEmptyString,
  }),
}, ({ fields, onSubmit }) => {
  const {t} = useTranslations()
  return (
  <form onSubmit={onSubmit} className={styles.form}>
    <InputHidden
      name="id"
      defaultValue={uuid()}
      {...fields.id}
    />
    <InputText
      label={t('title')}
      name="title"
      {...fields.title}
    />
    <InputText
      label={t('description')}
      name="description"
      {...fields.description}
    />
    <Button type="submit">{t('submit')}</Button>
  </form>
)
})

export default Organism