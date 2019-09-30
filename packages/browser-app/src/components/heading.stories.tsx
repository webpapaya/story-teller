import React from 'react';
import { storiesOf } from '../storybook';
import Heading from './heading';

storiesOf('Heading', module)
  .add('default', () => (
    <>
      <Heading variant="h1">A h1 Heading</Heading>
      <Heading variant="h2">A h2 Heading</Heading>
      <Heading variant="h3">A h3 Heading</Heading>
      <Heading variant="h4">A h4 Heading</Heading>
    </>
  ))
