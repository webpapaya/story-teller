import React from 'react';
import { storiesOf } from '../storybook';
import Task from './task';

storiesOf('Task', module)
  .add('default', () => (
    <>
      <Task id="1" title="Update Docs" column="Todo" />
      <Task id="2" title="Update Docs" column="Todo" />
      <Task id="3" title="Update Docs" column="Todo" />
      <Task id="4" title="Update Docs" column="Todo" />
      <Task id="5" title="Update Docs" column="Todo" />
      <Task id="6" title="Update Docs" column="Todo" />
    </>
  ))
  .add('closed', () => <Task id="1" title="Update Docs" column="Todo" done />)
