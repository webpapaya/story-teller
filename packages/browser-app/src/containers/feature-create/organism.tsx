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
    id: v.string,
    title: v.string,
    description: v.string,
  }),
}, ({ values, errors, onValueChange, onSubmit }) => (
  <form onSubmit={onSubmit} className={styles.form}>
    <InputHidden
      name="id"
      defaultValue={uuid()}
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
    <Button type="submit">Save</Button>
  </form>
))

export default Organism