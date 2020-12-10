import React from 'react';
import { storiesOf } from '../storybook';
import { Message } from './message';

storiesOf('Message', module)
  .add('default error', () => <Message>Some error message</Message>)
  .add('success', () => <Message variant="success">Some error message</Message>);