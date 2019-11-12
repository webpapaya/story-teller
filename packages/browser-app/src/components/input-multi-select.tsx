
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
  search: string,
  label: string,
  key: string
}
export type Props = {
  label: string,
  name: string,
  selectedOptions?: Option[],
  addNewOption?: (name: string) => Option,
  onChange?: (e: {
    preventDefault: () => void,
    target: { value: Option[], name: string, }
  }) => unknown
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

  constructor(props: Props) {
    super(props)
    this.state = {
        search: '',
        selectedItems: props.selectedOptions
          ? props.selectedOptions.map((option) => option.key)
          : [],
        newOptions: [] as Option[],
        cursor: 0,

    }
  }

  private toggleSelectedItem = (option: Option) => {
    const selectedItems = this.state.selectedItems;

    const nextSelectedItems = selectedItems.includes(option.key)
      ? selectedItems.filter((item) => item !== option.key)
      : [...selectedItems, option.key]

    const newItems = this.props.addNewOption && this.isUnknownOption(option)
      ? [...this.state.newOptions, option]
      : this.state.newOptions.filter((newItem) => nextSelectedItems.includes(newItem.key))

    this.setState({
      newOptions: newItems,
      selectedItems: nextSelectedItems,
    }, this.triggerChangeEvent)
  }

  private triggerChangeEvent = () => {
    if (!this.props.onChange) { return }
    this.props.onChange({
      preventDefault: () => {},
      target: {
        name: this.props.name,
        value: this.selectedValues
      }
    })
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

  private isUnknownOption(option: Option) {
    return this.state.search &&
      ![...this.state.newOptions, ...this.props.options]
        .map((option) => option.search.toLocaleLowerCase())
        .includes(option.search.toLocaleLowerCase())
  }

  private get filteredOptions() {
    const filteredOptions =
      this.options.filter((option) =>
        this.state.search === '' ||
          option.search.toLocaleLowerCase().includes(this.state.search.toLocaleLowerCase()))


    if (!this.props.addNewOption) { return filteredOptions }
    const newOption = this.props.addNewOption(this.state.search)

    if (this.isUnknownOption(newOption)) {
      filteredOptions.push(newOption)
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
