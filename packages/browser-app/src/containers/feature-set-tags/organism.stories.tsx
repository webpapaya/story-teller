import React from 'react';
import { action } from '@storybook/addon-actions'
import { storiesOf } from '../../storybook';
import Organism from './organism';

storiesOf('FeatureCreate', module)
  .add('default', () => <div />
    // <Organism
    //   // @ts-ignore
    //   onSubmit={action('onSubmit')}
    // />
  )

