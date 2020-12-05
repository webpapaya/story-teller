//@ts-ignore
import { assertThat, hasProperties} from 'hamjest'

import React from 'react';
import {render, fireEvent} from '@testing-library/react'
import isForm from './is-form'
import {v} from '@story-teller/shared'

const DummyForm = isForm({
  schema: v.record({
    test1: v.clampedString(0, 5),
  })
}, (props) => {
  return (
    <input
      data-testid="test1"
      type="text"
      name="test1"
      {...props.fields.test1}
    />
)})

it('when no value given renderes empty string', () => {
  const {queryByTestId} = render(<DummyForm />)
  assertThat(queryByTestId('test1'), hasProperties({
    value: ''
  }))
})

it('when defaultValue given renderes defaultValue', () => {
  const {queryByTestId} = render(<DummyForm defaultValues={{test1: 'hallo'}}/>)
  assertThat(queryByTestId('test1'), hasProperties({
    value: 'hallo'
  }))
})

it('after a change event, renders new input value', () => {
  const {queryByTestId} = render(<DummyForm defaultValues={{test1: 'hallo'}}/>)
  fireEvent.change(queryByTestId('test1')!, {target: {value: 'chuck'}})
  assertThat(queryByTestId('test1'), hasProperties({
    value: 'chuck'
  }))
})

it('invalid values are not changed', () => {
  const {queryByTestId} = render(<DummyForm defaultValues={{test1: 'hallo'}}/>)
  fireEvent.change(queryByTestId('test1')!, {target: {value: 'hallo'}})
  assertThat(queryByTestId('test1'), hasProperties({
    value: 'hallo'
  }))
})