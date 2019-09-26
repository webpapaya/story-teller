import React from 'react';
import { storiesOf } from '../../storybook';
import Organism from './organism';

storiesOf('UserRequestPasswordReset', module)
  .add('default', () => <Organism />)
