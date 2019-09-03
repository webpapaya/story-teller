//@ts-ignore
import { assertThat, hasProperties} from 'hamjest'

import React from 'react';
import {render, fireEvent, queryHelpers} from '@testing-library/react'
import isForm from './is-form'
import * as v from 'validation.ts'

const DummyForm = isForm({
  validator: v.object({
    test1: v.string.filter((x) => x.length <= 5),
  })
}, (props) => {
  return (
    <input
      data-testid="test1"
      type="text"
      name="test1"
      value={props.values.test1}
      onChange={props.onValueChange}
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
  fireEvent.change(queryByTestId('test1')!, {target: {value: 'halloooo'}})
  assertThat(queryByTestId('test1'), hasProperties({
    value: 'hallo'
  }))
})