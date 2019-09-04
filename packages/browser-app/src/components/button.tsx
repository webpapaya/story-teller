import React from 'react';
import styles from './button.module.css'
import theme from './theme-colors.module.css'
import { css } from '../utils/css';

type ButtonProps = {
  color?: 'primary' | 'secondary' | 'danger'
  children: React.ReactNode,
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  disabled?: boolean
}

export const Button = ({ children, type='submit', block, color = 'primary', disabled }: ButtonProps) => (
  <button type={type} className={
    css(
      theme[color],
      styles.button,
      block && styles.block,
      disabled && styles.disabled
    )
  }>
    { children }
  </button>
)
