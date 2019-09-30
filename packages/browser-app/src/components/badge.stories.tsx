import React from 'react';
import { storiesOf } from '../storybook';
import Badge from './badge';

storiesOf('Badge', module)
  .add('default', () => (
    <Badge
      topLeft="Sepp Huber"
      title="Fixed typo"
      bottomLeft="1 additional Tasks"
    />
  ))
  .add('li', () => (
    <>
      <Badge
        tagName="li"
        topLeft="Top left"
        topRight="Top right"
        title="Fixed typo"
      />
      <Badge
        tagName="li"
        bottomLeft="Top left"
        bottomRight="Top right"
        title="Fixed typo"
      />
      <Badge
        tagName="li"
        topLeft="Top left"
        title="Fixed typo"
      />
      <Badge
        tagName="li"
        topRight="Top right"
        title="Fixed typo"
      />
      <Badge
        tagName="li"
        bottomLeft="Bottom left"
        title="Fixed typo"
      />
      <Badge
        tagName="li"
        bottomRight="Bottom right"
        title="Fixed typo"
      />
    </>
  ))
