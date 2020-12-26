import React from 'react';
import isForm from '../../is-form';
import {v} from '@story-teller/shared'
import { Button } from '../../components/button';
import { InputPassword } from '../../components/input-password';
import { Link } from '../../components/link';
import { OrganismPropsType } from './types';
import { InputHidden } from '../../components/input-hidden';

const schema = v.record({
  id: v.string,
  token: v.string,
  password: v.string,
})

const Organism = isForm<typeof schema, OrganismPropsType>({
  initialValues: {
    id: '',
    token: '',
    password: '',
  },
  schema,
}, ({ fields, onSubmit }) => (
  <form onSubmit={onSubmit}>
    <InputHidden
      defaultValue=""
      {...fields.id}
    />

    <InputHidden
      defaultValue=""
      {...fields.token}
    />

    <InputPassword
      label="New password"
      {...fields.password}
    />

    <Button block marginBottom>Submit</Button>
    <Link to="/" variant="link" block>
      Cancel
    </Link>
  </form>
))

export default Organism