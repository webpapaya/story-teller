import React from 'react';
import { action } from '@storybook/addon-actions'
import { storiesOf } from '../../storybook';
import Organism from './organism';

storiesOf('UserResetPassword', module)
  .add('default', () => <Organism
    defaultValues={{
      id: 'id',
      token: 'token'
    }}
    // @ts-ignore
    onSubmit={action('onSubmit')}
  />)
