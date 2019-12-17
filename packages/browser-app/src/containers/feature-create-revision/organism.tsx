import React from 'react';
import {v} from '@story-teller/shared'
import uuid from 'uuid'
import isForm from '../../is-form';
import { InputText } from '../../components/input-text';
import { Button } from '../../components/button';
import { OrganismPropsType } from './types';
import styles from './organism.module.css'
import { InputHidden } from '../../components/input-hidden';

const Organism = isForm<any, any>({
  schema: v.record({
    id: v.uuid,
    title: v.nonEmptyString,
    description: v.nonEmptyString,
    originalId: v.uuid,
    reason: v.nonEmptyString,
  })
}, ({ onSubmit, onValueChange, values, errors, id }) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <InputHidden
        name="id"
        defaultValue={uuid()}
        onChange={onValueChange}
      />
      <InputHidden
        name="originalId"
        defaultValue={id}
        onChange={onValueChange}
      />
      <InputText
        label="Title"
        name="title"
        value={values.title}
        error={errors.title}
        onChange={onValueChange}
      />
      <InputText
        label="Description"
        name="description"
        value={values.description}
        error={errors.description}
        onChange={onValueChange}
      />
      <InputText
        label="Reason"
        name="reason"
        value={values.reason}
        error={errors.reason}
        onChange={onValueChange}
      />
      <Button type="submit">Save</Button>
    </form>
  )
})

export default Organism