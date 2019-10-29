import React from 'react';
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
        originalId: uuid(),
        version: 0,
        tags: []
      }, {
        id: uuid(),
        title: 'A Feature',
        description: 'Irrelevant',
        originalId: uuid(),
        version: 0,
        tags: []
      }
    ]}/>
  ))

