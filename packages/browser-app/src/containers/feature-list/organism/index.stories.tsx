import React from 'react';
import { action } from '@storybook/addon-actions'
import { storiesOf } from '../../../storybook';
import Organism from '.';

storiesOf('FeatureList', module)
  .add('default', () => (
    <Organism features={[]}/>
  ))

