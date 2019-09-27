import React from 'react';
import { storiesOf } from '../storybook';
import Badge from './badge';

storiesOf('Badge', module)
  .add('default', () => (
    <Badge
      top="Sepp Huber"
      title="Fixed typo"
      bottom="1 additional Tasks"
    />
  ))
  .add('li', () => (
    <>
      <Badge
        tagName="li"
        top="Sepp Huber"
        title="Fixed typo"
        bottom="1 additional Tasks"
      />
      <Badge
        tagName="li"
        top="Sepp Huber"
        title="Fixed typo"
        bottom="1 additional Tasks"
      />
      <Badge
        tagName="li"
        top="Sepp Huber"
        title="Fixed typo"
        bottom="1 additional Tasks"
      />
    </>
  ))
