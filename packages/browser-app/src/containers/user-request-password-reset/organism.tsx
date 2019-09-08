import React from 'react';
import isForm from '../../is-form';
import * as v from 'validation.ts'
import { InputText } from '../../components/input-text';
import { Button } from '../../components/button';

const Organism = isForm({
  defaultValues: {
    userIdentifier: '',
  },
  schema: v.object({
    userIdentifier: v.string,
  }),
}, ({ values, onValueChange, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <InputText
      label="E-Mail"
      name="userIdentifier"
      value={values.userIdentifier}
      onChange={onValueChange}
    />
    <Button block>Submit</Button>
  </form>
))

export default Organism