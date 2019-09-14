import React from 'react'
// @ts-ignore
import { assertThat, everyItem, truthy as present, hasProperties } from 'hamjest'
import { render, fireEvent, queryByText, cleanup } from '@testing-library/react'
import {InputMultiSelect} from './input-multi-select'

const renderInputMultiselect = () => render(
  <InputMultiSelect
    label="Search Tags"
    name="tags"
    options={[
      { key: 'first', value: 'first', label: 'first' },
      { key: 'second', value: 'second', label: 'second' },
    ]}
  />
)

afterEach(cleanup);

it('without search filter, renders all options', async () => {
  const { container } = renderInputMultiselect();
  assertThat([
    queryByText(container, 'first'),
    queryByText(container, 'second'),
  ], everyItem(present()))
})

it('with search filter present, renders applicable options', async () => {
  const { container } = renderInputMultiselect();
  const searchBox = container.querySelector('input[name="tags"]')!
  fireEvent.change(searchBox, { target: { value: 'fi' } })

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  assertThat(checkboxes, hasProperties({
    length: 1,
    0: hasProperties({ name: 'first', checked: false }),
  }))

  assertThat([
    queryByText(container, 'first'),
  ], everyItem(present()))
})

it('when enter clicked, first option is selected', async () => {
  const { container } = renderInputMultiselect();
  const searchBox = container.querySelector('input[name="tags"]')!

  fireEvent.keyDown(searchBox, { key: 'Enter' });
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  assertThat(checkboxes, hasProperties({
    0: hasProperties({ name: 'first', checked: true }),
    1: hasProperties({ name: 'second', checked: false }),
  }))
})

it('when value selected and search changed, selects first element', async () => {
  const { container } = renderInputMultiselect();
  const searchBox = container.querySelector('input[name="tags"]')!

  fireEvent.keyDown(searchBox, { key: 'ArrowDown' });
  fireEvent.change(searchBox, { target: { value: 'se' } })
  fireEvent.keyDown(searchBox, { key: 'Enter' });
  fireEvent.change(searchBox, { target: { value: '' } })

  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  assertThat(checkboxes, hasProperties({
    0: hasProperties({ name: 'first', checked: false }),
    1: hasProperties({ name: 'second', checked: true }),
  }))
})

it('when selected after cursor moved 1 down, second option is selected', async () => {
    const { container } = renderInputMultiselect();
    const searchBox = container.querySelector('input[name="tags"]')!

    fireEvent.keyDown(searchBox, { key: 'ArrowDown' });
    fireEvent.keyDown(searchBox, { key: 'Enter' });
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');

    assertThat(checkboxes, hasProperties({
      0: hasProperties({ name: 'first', checked: false }),
      1: hasProperties({ name: 'second', checked: true }),
    }))
})

it('when selected after cursor moved 2 down, first option is selected again', async () => {
  const { container } = renderInputMultiselect();
  const searchBox = container.querySelector('input[name="tags"]')!

  fireEvent.keyDown(searchBox, { key: 'ArrowDown' });
  fireEvent.keyDown(searchBox, { key: 'ArrowDown' });

  fireEvent.keyDown(searchBox, { key: 'Enter' });
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  assertThat(checkboxes, hasProperties({
    0: hasProperties({ name: 'first', checked: true }),
    1: hasProperties({ name: 'second', checked: false }),
  }))
})

it('when selected after cursor moved up 1 time, last option is selected', async () => {
  const { container } = renderInputMultiselect();
  const searchBox = container.querySelector('input[name="tags"]')!

  fireEvent.keyDown(searchBox, { key: 'ArrowUp' });
  fireEvent.keyDown(searchBox, { key: 'Enter' });
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  assertThat(checkboxes, hasProperties({
    0: hasProperties({ name: 'first', checked: false }),
    1: hasProperties({ name: 'second', checked: true }),
  }))
})

it('when no item selectable (due to filter) and cursor moved, nothing selected', async () => {
  const { container } = renderInputMultiselect();
  const searchBox = container.querySelector('input[name="tags"]')!

  fireEvent.change(searchBox, { target: { value: 'Unknown Tag' } })
  fireEvent.keyDown(searchBox, { key: 'ArrowUp' });
  fireEvent.keyDown(searchBox, { key: 'Enter' });
  fireEvent.change(searchBox, { target: { value: '' } })
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');

  assertThat(checkboxes, hasProperties({
    0: hasProperties({ name: 'first', checked: false }),
    1: hasProperties({ name: 'second', checked: false }),
  }))
})