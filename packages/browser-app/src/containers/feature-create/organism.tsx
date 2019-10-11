import React from 'react';
import * as v from 'validation.ts'
import isForm from '../../is-form';
import { InputText } from '../../components/input-text';
import { InputTextarea } from '../../components/editor/editor';
import styles from './organism.module.css'

const Organism = isForm({
  defaultValues: {
    title: '',
    description: ''
  },
  schema: v.object({
    title: v.string,
    description: v.string,
  }),
}, ({ values, onValueChange, onSubmit }) => (
  <form onSubmit={onSubmit} className={styles.form}>
    <InputText
      label="Title"
      name="title"
      value={values.title}
      onChange={onValueChange}
    />
    <InputTextarea

    />
    {/* <nav className={styles.actions}>
      <Button>Create</Button>
    </nav> */}
  </form>
))

export default Organism