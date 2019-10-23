import React from 'react';
import * as v from 'validation.ts'
import uuid from 'uuid'
import isForm from '../../is-form';
import { InputText } from '../../components/input-text';
import { Button } from '../../components/button';
import { OrganismPropsType } from './types';
import styles from './organism.module.css'
import { InputHidden } from '../../components/input-hidden';

const Organism = isForm<any, any>({
  schema: v.object({
    id: v.string,
    title: v.string,
    description: v.string,
    originalId: v.string,
  })
}, ({ onSubmit, onValueChange, values, id }) => {
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
        onChange={onValueChange}
      />
      <InputText
        label="Description"
        name="description"
        value={values.description}
        onChange={onValueChange}
      />
      <Button type="submit">Save</Button>
    </form>
  )
})

export default Organism