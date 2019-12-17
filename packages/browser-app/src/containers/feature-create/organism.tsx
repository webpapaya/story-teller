import React from 'react';
import {v} from '@story-teller/shared'
import uuid from 'uuid'
import isForm from '../../is-form';
import { InputText } from '../../components/input-text';
import { Button } from '../../components/button';
import { OrganismPropsType } from './types';
import styles from './organism.module.css'
import { InputHidden } from '../../components/input-hidden';

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
}, ({ fields, onSubmit }) => (
  <form onSubmit={onSubmit} className={styles.form}>
    { console.log(fields) }
    <InputHidden
      name="id"
      defaultValue={uuid()}
      {...fields.id}
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
    <Button type="submit">Save</Button>
  </form>
))

export default Organism