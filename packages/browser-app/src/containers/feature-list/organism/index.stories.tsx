import React from 'react';
import { action } from '@storybook/addon-actions'
import { storiesOf } from '../../../storybook';
import Organism from '.';
import uuid from 'uuid';

storiesOf('FeatureList', module)
  .add('default', () => (
    <Organism features={[
      {
        id: uuid(),
        title: 'A Feature',
        description: 'Irrelevant',
        nextFeatureId: null,
        previousFeatureId: null,
        originalFeatureId: uuid()
      }, {
        id: uuid(),
        title: 'A Feature',
        description: 'Irrelevant',
        nextFeatureId: null,
        previousFeatureId: null,
        originalFeatureId: uuid()
      }
    ]}/>
  ))

