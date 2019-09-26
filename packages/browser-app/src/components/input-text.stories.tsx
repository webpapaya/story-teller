
import React from 'react';
import { storiesOf } from '../storybook';
import {InputText} from './input-text';

storiesOf('InputText', module)
  .add('default', () => (
    <>
      <InputText
        label="Tags"
        name="tags"
      />
      <InputText
        label="Tags"
        name="tags"
        error="This field is required"
      />
      <InputText
        label="Tags"
        name="tags"
      />
    </>
  ))
  .add('variant title', () => (
    <>
      <InputText
        label="Tags"
        name="tags"
        variant='title'
      />
    </>
  ))


