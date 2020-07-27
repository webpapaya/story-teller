import React from 'react';
import { storiesOf } from '../../storybook';
import DomainObject from '.';
import { v } from '@story-teller/shared'

const record = v.aggregate({
  someString: v.string,
  someNumber: v.number,
  someArray: v.array(v.entity({
    someString: v.option(v.string)
  }))
})

storiesOf('DomainObject', module)
  .add('string', () => (
    <DomainObject codec={v.string} />
  ))
  .add('string | number', () => (
    <DomainObject codec={v.union([v.string, v.number])} />
  ))
  .add('optional string', () => (
    <DomainObject codec={v.option(v.string)} />
  ))
