import React from 'react';
import { storiesOf } from '../../storybook';
import ListItem from '.';

storiesOf('ListGroup', module)
  .add('default', () => (
    <>
      <ListItem id="1" title="Update Docs 1" column="Todo" />
      <ListItem id="2" title="Update Docs 2" column="Todo" />
      <ListItem id="3" title="Update Docs 3" column="Todo" />
      <ListItem id="4" title="Update Docs 4" column="Todo" />
      <ListItem id="5" title="Update Docs 5" column="Todo" />
      <ListItem id="6" title="Update Docs 6" column="Todo" />
    </>
  ))
  .add('closed', () => <ListItem id="1" title="Update Docs" column="Todo" done />)


