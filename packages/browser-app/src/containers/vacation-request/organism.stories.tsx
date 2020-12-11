import React from 'react';
import { action } from '@storybook/addon-actions'
import { storiesOf } from '../../storybook';
import Organism from './organism';

storiesOf('VacationRequest', module)
  .add('default', () =>
    <Organism onSubmit={action('submit')} />
  )
