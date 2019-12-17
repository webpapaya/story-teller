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
}, ({ onSubmit, fields, id }) => {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <InputHidden
        name="id"
        defaultValue={uuid()}
        {...fields.id}
      />
      <InputHidden
        name="originalId"
        defaultValue={id}
        {...fields.originalId}
      />
      <InputText
        label="Title"
        name="title"
        {...fields.title}
      />
      <InputText
        label="Description"
        name="description"
        {...fields.description}
      />
      <InputText
        label="Reason"
        name="reason"
        {...fields.reason}
      />
      <Button type="submit">Save</Button>
    </form>
  )
})

export default Organism