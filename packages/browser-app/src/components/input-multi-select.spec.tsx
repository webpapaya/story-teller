import React from 'react'
// @ts-ignore
import { assertThat, everyItem, truthy as present, hasProperties, allOf, equalTo, hasProperty } from 'hamjest'
import { render, fireEvent, queryByText, cleanup } from '@testing-library/react'
import {InputMultiSelect, Props} from './input-multi-select'
import sinon from 'sinon'
import uuid from 'uuid'

const lastCallArgs = (matcher: any) =>
  hasProperty('lastCall', hasProperty('args', matcher))

const OPTIONS = [
  { key: 'first key', value: 'first value', search: 'first search', label: 'first label' },
  { key: 'second key', value: 'second value', search: 'second search', label: 'second label' },
]
const renderInputMultiSelect = (props: Partial<Props> = {}) => render(
  <InputMultiSelect
    label="Search Tags"
    name="tags"
    options={OPTIONS}
    { ...props }
  />
)

afterEach(cleanup);

it('without search filter, renders all options', async () => {
  const { container } = renderInputMultiSelect();
  assertThat([
    queryByText(container, 'first label'),
    queryByText(container, 'second label'),
  ], everyItem(present()))
})

it('with search filter present, renders applicable options', async () => {
  const { container } = renderInputMultiSelect();
  const searchBox = container.querySelector('input[name="tags"]')!
  fireEvent.change(searchBox, { target: { value: 'fi' } })

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  assertThat(checkboxes, hasProperties({
    length: 1,
    0: hasProperties({ value: 'first key', checked: false }),
  }))
})

describe('when enter is clicked', () => {
  it('first option is selected', async () => {
    const { container } = renderInputMultiSelect();
    const searchBox = container.querySelector('input[name="tags"]')!

    fireEvent.keyDown(searchBox, { key: 'Enter' });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    assertThat(checkboxes, hasProperties({
      0: hasProperties({ value: 'first key', checked: true }),
      1: hasProperties({ value: 'second key', checked: false }),
    }))
  })

  it('AND change event is emitted', () => {
    const onChange = sinon.spy()
    const { container } = renderInputMultiSelect({ onChange });
    const searchBox = container.querySelector('input[name="tags"]')!

    fireEvent.keyDown(searchBox, { key: 'Enter' });
    assertThat(onChange, lastCallArgs(equalTo([{ target: { value: [
      OPTIONS[0].value
    ]}}])))
  })
})


it('when value selected and search changed, selects first element', async () => {
  const { container } = renderInputMultiSelect();
  const searchBox = container.querySelector('input[name="tags"]')!

  fireEvent.keyDown(searchBox, { key: 'ArrowDown' });
  fireEvent.change(searchBox, { target: { value: 'se' } })
  fireEvent.keyDown(searchBox, { key: 'Enter' });
  fireEvent.change(searchBox, { target: { value: '' } })

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  assertThat(checkboxes, hasProperties({
    0: hasProperties({ value: 'first key', checked: false }),
    1: hasProperties({ value: 'second key', checked: true }),
  }))
})

it('when selected after cursor moved 1 down, second option is selected', async () => {
    const { container } = renderInputMultiSelect();
    const searchBox = container.querySelector('input[name="tags"]')!

    fireEvent.keyDown(searchBox, { key: 'ArrowDown' });
    fireEvent.keyDown(searchBox, { key: 'Enter' });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    assertThat(checkboxes, hasProperties({
      0: hasProperties({ value: 'first key', checked: false }),
      1: hasProperties({ value: 'second key', checked: true }),
    }))
})

it('WHEN selected after cursor moved 2 down, first option is selected again', async () => {
  const { container } = renderInputMultiSelect();
  const searchBox = container.querySelector('input[name="tags"]')!

  fireEvent.keyDown(searchBox, { key: 'ArrowDown' });
  fireEvent.keyDown(searchBox, { key: 'ArrowDown' });

  fireEvent.keyDown(searchBox, { key: 'Enter' });
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  assertThat(checkboxes, hasProperties({
    0: hasProperties({ value: 'first key', checked: true }),
    1: hasProperties({ value: 'second key', checked: false }),
  }))
})

it('WHEN selected after cursor moved up 1 time, last option is selected', async () => {
  const { container } = renderInputMultiSelect();
  const searchBox = container.querySelector('input[name="tags"]')!

  fireEvent.keyDown(searchBox, { key: 'ArrowUp' });
  fireEvent.keyDown(searchBox, { key: 'Enter' });
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  assertThat(checkboxes, hasProperties({
    0: hasProperties({ value: 'first key', checked: false }),
    1: hasProperties({ value: 'second key', checked: true }),
  }))
})

it('WHEN no item selectable (due to filter) and cursor moved, nothing selected', async () => {
  const { container } = renderInputMultiSelect();
  const searchBox = container.querySelector('input[name="tags"]')!

  fireEvent.change(searchBox, { target: { value: 'Unknown Tag' } })
  fireEvent.keyDown(searchBox, { key: 'ArrowUp' });
  fireEvent.keyDown(searchBox, { key: 'Enter' });
  fireEvent.change(searchBox, { target: { value: '' } })
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  assertThat(checkboxes, hasProperties({
    0: hasProperties({ value: 'first key', checked: false }),
    1: hasProperties({ value: 'second key', checked: false }),
  }))
})



describe('WHEN new items can be added', () => {
  it('when enter clicked, first option is selected', async () => {
    const { container } = renderInputMultiSelect();
    const searchBox = container.querySelector('input[name="tags"]')!

    fireEvent.keyDown(searchBox, { key: 'Enter' });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    assertThat(checkboxes, hasProperties({
      0: hasProperties({ value: 'first key', checked: true }),
      1: hasProperties({ value: 'second key', checked: false }),
    }))
  })

  it('when option is not found, adds new item', () => {
    const { container } = renderInputMultiSelect({ addNewOption: (name) => ({
      key: name,
      value: name,
      search: name,
      label: name,
    })});
    const searchBox = container.querySelector('input[name="tags"]')!

    fireEvent.change(searchBox, { target: { value: 'new' } })
    fireEvent.keyDown(searchBox, { key: 'ArrowDown' });
    fireEvent.keyDown(searchBox, { key: 'Enter' });
    fireEvent.change(searchBox, { target: { value: '' } })

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    assertThat(checkboxes, hasProperties({
      0: hasProperties({ value: 'first key', checked: false }),
      1: hasProperties({ value: 'second key', checked: false }),
      2: hasProperties({ value: 'new', checked: true }),
    }))
  })

  it('when option is not found, adds new item with varying key', () => {
    const { container } = renderInputMultiSelect({ addNewOption: (name) => ({
      key: uuid(),
      value: name,
      search: name,
      label: name,
    })});
    const searchBox = container.querySelector('input[name="tags"]')!

    fireEvent.change(searchBox, { target: { value: 'new' } })
    fireEvent.keyDown(searchBox, { key: 'ArrowDown' });
    fireEvent.keyDown(searchBox, { key: 'Enter' });
    fireEvent.change(searchBox, { target: { value: '' } })

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    assertThat(checkboxes, hasProperties({
      0: hasProperties({ value: 'first key', checked: false }),
      1: hasProperties({ value: 'second key', checked: false }),
      2: hasProperties({ checked: true }),
    }))
  })

  it('removes new item when unselected', () => {
    const { container } = renderInputMultiSelect({ addNewOption: (name) => ({
      key: name,
      value: name,
      search: name,
      label: name,
    })});
    const searchBox = container.querySelector('input[name="tags"]')!

    fireEvent.change(searchBox, { target: { value: 'new' } })
    fireEvent.keyDown(searchBox, { key: 'ArrowDown' });
    fireEvent.keyDown(searchBox, { key: 'Enter' });
    fireEvent.keyDown(searchBox, { key: 'Enter' });
    fireEvent.change(searchBox, { target: { value: '' } })

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    assertThat(checkboxes, allOf(
      hasProperties({
        length: 2,
        0: hasProperties({ value: 'first key', checked: false }),
        1: hasProperties({ value: 'second key', checked: false }),
      })
    ))
  })
})