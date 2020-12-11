import { v } from '@story-teller/shared';
import React from 'react'
import { Button } from '../../components/button';
import { InputDate } from '../../components/input-date';
import isForm from '../../is-form';
import styles from './organism.module.css';
import { useTranslations } from './translations';

const Organism = isForm({
  initialValues: {},
  schema: v.record({
    startDate: v.date,
    endDate: v.date
  })
}, ({ onSubmit, fields, submitButton }) => {
  const { t } = useTranslations()

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <InputDate
        label={t('startDate')}
        { ...fields.startDate }
        usesGridArea
      />

      <InputDate
        label={t('endDate')}
        { ...fields.endDate }
        usesGridArea
      />

      <Button {...submitButton} usesGridArea>
        {t('submit')}
      </Button>
      <Button
        type='reset'
        variant="link"
        color="monochrome"
        usesGridArea
      >
        {t('cancel')}
      </Button>
    </form>
  )
})

export default Organism;