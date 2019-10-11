
import React from 'react';
import { storiesOf } from '../storybook';
import {InputMultiSelect} from './input-multi-select';

storiesOf('InputMultiSelect', module)
  .add('default', () => <InputMultiSelect
    label="Tags"
    name="tags"
    options={[
      { key: 'test1', label: 'First', value: 1 },
      { key: 'test2', label: 'Second', value: 2 },
      { key: 'test3', label: 'Third', value: 3 }
    ]}
  />)