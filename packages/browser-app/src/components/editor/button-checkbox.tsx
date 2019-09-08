import React from 'react';
import styles from './button-checkbox.module.css'
import { css } from '../../utils/css';

type ButtonCheckboxProps = {
  checked: boolean
  name: string,
  onChange: (style: string) => void
  children: React.ReactChild,
}

export class ButtonCheckbox extends React.Component<ButtonCheckboxProps> {
  onToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    this.props.onChange(this.props.name);
  };

  render() {
    return (
      <button
        onMouseDown={this.onToggle}
        className={css(
          styles.button,
          this.props.checked && styles.checked,
        )}
      >
        {this.props.children}
      </button>
    );
  }
}