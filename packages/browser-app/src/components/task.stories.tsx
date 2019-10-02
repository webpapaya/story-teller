import React from 'react';
import { storiesOf } from '../storybook';
import Task from './task';

storiesOf('Task', module)
  .add('default', () => (
    <>
      <Task id="1" title="Update Docs 1" column="Todo" />
      <Task id="2" title="Update Docs 2" column="Todo" />
      <Task id="3" title="Update Docs 3" column="Todo" />
      <Task id="4" title="Update Docs 4" column="Todo" />
      <Task id="5" title="Update Docs 5" column="Todo" />
      <Task id="6" title="Update Docs 6" column="Todo" />
    </>
  ))
  .add('closed', () => <Task id="1" title="Update Docs" column="Todo" done />)


