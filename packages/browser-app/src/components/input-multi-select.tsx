
import React, { ChangeEvent, KeyboardEvent } from 'react';
import styles from './input-multi-select.module.css'
import {InputText} from './input-text'
import { css } from '../utils/css';
import {
  Check,
  Clear
} from '@material-ui/icons';


type Props = {
  label: string,
  name: string,
  options: {
    value: any,
    label: string,
    key: string
  }[]
}

type State = {
  search: string,
  selectedItems: any[],
  cursor: number,
}

export class InputMultiSelect extends React.Component<Props, State> {
  searchRef: React.Ref<HTMLInputElement> = React.createRef()
  state = {
    search: '',
    selectedItems: [] as string[],
    cursor: 0,
  }

  toggleSelectedItem = (value: any) => {
    const selectedItems = this.state.selectedItems;
    selectedItems.includes(value)
      ? this.setState(() => ({ selectedItems: selectedItems.filter((item) => item !== value) }))
      : this.setState(() => ({ selectedItems: [...selectedItems, value] }))
  }

  setCursorState = (cursor:number) => {
    this.setState({ cursor })
  }

  onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({
      search: e.target.value,
    }, () => this.setCursorState(this.findNextCursorPosition(0)))
  }

  onItemSelect = (value: any) => (e: ChangeEvent<HTMLInputElement>) => {
    this.toggleSelectedItem(value);
    this.focusSearchBox();
  }

  focusSearchBox() {
    if (this.searchRef) {
      // @ts-ignore
      this.searchRef.current.focus()
    }
  }

  handleEnter = () => {
    const firstOption = this.filteredOptions[this.state.cursor];
    if (firstOption) { this.toggleSelectedItem(firstOption.value) }
  }

  findNextCursorPosition(direction: number) {
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

  handleCursor = (direction: number) => {
    this.setCursorState(this.findNextCursorPosition(direction));
  }

  onSearchKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        return this.handleEnter();
      case 'ArrowUp':
        e.preventDefault();
        return this.handleCursor(-1);
      case 'ArrowDown':
        e.preventDefault();
        return this.handleCursor(+1);
    }
  }

  get filteredOptions() {
    return this.props.options.filter((option) =>
      this.state.search === '' || option.label.toLocaleLowerCase().includes(this.state.search.toLocaleLowerCase()))
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
        />

        {this.filteredOptions.map((option, idx) => {
          const isChecked = this.state.selectedItems.includes(option.value)
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
                name={option.key}
                value={option.value}
                checked={isChecked}
                onChange={this.onItemSelect(option.value)}
              />

              <Check fontSize="small" className={css(styles.checkIcon)} />
              { this.filteredOptions.includes(option) && option.label }
              <Clear fontSize="small" className={css(styles.clearIcon)} />
            </label>
        )})}
      </section>
    )
  }
}
