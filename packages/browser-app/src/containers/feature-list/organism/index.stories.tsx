import React from 'react';
import { storiesOf } from '../../../storybook';
import Organism from '.';
import { Feature } from '@story-teller/shared';

storiesOf('FeatureList', module)
  .add('default', () => (
    <Organism features={Feature.aggregate.build().map((x) => x())}/>
  ))

