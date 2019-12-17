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
    name: '',
  },
  schema: v.record({
    id: v.uuid,
    name: v.nonEmptyString,
  }),
}, ({ fields, onSubmit }) => (
  <form onSubmit={onSubmit} className={styles.form}>
    <InputHidden
      name="id"
      defaultValue={uuid()}
      {...fields.id}
    />
    <InputText
      label="name"
      name="name"
      {...fields.name}
    />
    <Button type="submit">Save</Button>
  </form>
))

export default Organism