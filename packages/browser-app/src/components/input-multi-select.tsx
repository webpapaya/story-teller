
import React, { ChangeEvent, KeyboardEvent } from 'react';
import styles from './input-multi-select.module.css'
import {InputText} from './input-text'
import { css } from '../utils/css';
import {
  Check,
  Clear
} from '@material-ui/icons';

type Option = {
  value: any,
  label: string,
  key: string
}
export type Props = {
  label: string,
  name: string,
  addNewOption?: (name: string) => Option,
  onChange?: (e: { target: { value: Option[]} }) => unknown
  options: Option[]
}

type State = {
  search: string,
  selectedItems: any[],
  cursor: number,
  newOptions: Option[]
}

export class InputMultiSelect extends React.Component<Props, State> {
  searchRef: React.Ref<HTMLInputElement> = React.createRef()
  state = {
    search: '',
    selectedItems: [] as string[],
    newOptions: [] as Option[],
    cursor: 0,
  }

  private toggleSelectedItem = (option: Option) => {
    const selectedItems = this.state.selectedItems;

    const nextSelectedItems = selectedItems.includes(option.value)
      ? selectedItems.filter((item) => item !== option.value)
      : [...selectedItems, option.key]

    const newItems = this.props.addNewOption && this.isUnknownOption()
      ? [...this.state.newOptions, option]
      : this.state.newOptions.filter((newItem) => nextSelectedItems.includes(newItem.key))

    this.setState({
      newOptions: newItems,
      selectedItems: nextSelectedItems
    }, this.triggerChangeEvent)
  }

  private triggerChangeEvent = () => {
    if (!this.props.onChange) { return }
    this.props.onChange({ target: { value: this.selectedValues }})
  }

  private get selectedValues() {
    return this.options
      .filter((option) => this.state.selectedItems.includes(option.key))
      .map((option) => option.value)
  }

  private setCursorState = (cursor:number) => {
    this.setState({ cursor })
  }

  private onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      search: e.target.value,
    }, () => this.setCursorState(this.findNextCursorPosition(0)))
  }

  private onItemSelect = (option: Option) => (e: ChangeEvent<HTMLInputElement>) => {
    this.toggleSelectedItem(option);
    this.focusSearchBox();
  }

  private focusSearchBox() {
    if (this.searchRef) {
      // @ts-ignore
      this.searchRef.current.focus()
    }
  }

  private findNextCursorPosition(direction: number) {
    const cursor = this.state.cursor;
    const nextPosition = (cursor + direction) % this.filteredOptions.length;
    if (this.filteredOptions.length === 0) {
      return 0;
    } else if (nextPosition >= 0) {
      return nextPosition;
    } else {
      return this.filteredOptions.length - 1
    }
  }

  private selectOption = (option: Option) => {
    const firstOption = this.filteredOptions[this.state.cursor];
    if (firstOption) { return this.toggleSelectedItem(firstOption) }
    if (this.props.addNewOption) { this.toggleSelectedItem(option) }
  }

  private setCursor = (direction: number) => {
    this.setCursorState(this.findNextCursorPosition(direction));
  }

  private onSearchKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        return this.selectOption(this.filteredOptions[this.state.cursor]);
      case 'ArrowUp':
        e.preventDefault();
        return this.setCursor(-1);
      case 'ArrowDown':
        e.preventDefault();
        return this.setCursor(+1);
    }
  }

  private isUnknownOption() {
    return this.state.search &&
      ![...this.state.newOptions, ...this.props.options]
        .map((option) => option.label.toLocaleLowerCase())
        .includes(this.state.search.toLocaleLowerCase())
  }

  private get filteredOptions() {
    const filteredOptions =
      this.options.filter((option) =>
        this.state.search === '' ||
          option.label.toLocaleLowerCase().includes(this.state.search.toLocaleLowerCase()))

    if (this.props.addNewOption && this.isUnknownOption()) {
      filteredOptions.push(this.props.addNewOption(this.state.search))
    }

    return filteredOptions
  }

  private get options() {
    return [
      ...this.props.options,
      ...this.state.newOptions
    ]
  }

  render() {
    return (
      <section>
        <InputText
          label={this.props.label}
          name={this.props.name}
          ref={this.searchRef}
          onKeyDown={this.onSearchKeyUp}
          onChange={this.onSearchChange}
          variant="title"
        />

        {this.filteredOptions.map((option, idx) => {
          const isChecked = this.state.selectedItems.includes(option.key)
          return (
            <label
              key={option.key}
              onMouseEnter={() => this.setCursorState(idx)}
              className={css(
                styles.label,
                isChecked && styles.checked,
                idx === this.state.cursor && styles.focused,
            )}>
              <input
                className={css(
                  styles.input
                )}
                type="checkbox"
                key={option.key}
                name={this.props.name}
                value={option.key}
                checked={isChecked}
                onChange={this.onItemSelect(option)}
              />

              <Check fontSize="small" className={css(styles.checkIcon)} />
              { option.label }
              <Clear fontSize="small" className={css(styles.clearIcon)} />
            </label>
        )})}
      </section>
    )
  }
}
