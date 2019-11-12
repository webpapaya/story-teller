
import React from 'react';
import { storiesOf } from '../storybook';
import {InputMultiSelect} from './input-multi-select';

storiesOf('InputMultiSelect', module)
  .add('default', () => <InputMultiSelect
    label="Tags"
    name="tags"
    options={[
      { key: 'test1', search: 'First', value: 1, label: 'First', },
      { key: 'test2', search: 'Second', value: 2, label: 'Second', },
      { key: 'test3', search: 'Third', value: 3, label: 'Third', }
    ]}
  />)
  .add('with element to be added', () => <InputMultiSelect
    label="Tags"
    name="tags"
    addNewOption={(name) => ({
      key: name,
      search: name,
      value: name,
      label: `Add "${name}" as new tag`
    })}
    options={[
      { key: 'test1', search: 'First', value: 1, label: 'First' },
      { key: 'test2', search: 'Second', value: 2, label: 'Second' },
      { key: 'test3', search: 'Third', value: 3, label: 'Third' }
    ]}
  />)
