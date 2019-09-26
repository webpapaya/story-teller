import React from 'react';
import styles from './button.module.css'
import theme from './theme-colors.module.css'
import { css } from '../utils/css';

type ButtonProps = {
  color?: 'primary' | 'secondary' | 'danger' | 'monochrome',
  size?: 'regular' | 'small'
  variant?: 'solid' | 'link' | 'outline'
  children: React.ReactNode,
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  disabled?: boolean
}

export const Button = ({
  children,
  type='submit',
  color = 'primary',
  size = 'regular',
  block = false,
  disabled = false,
  variant = 'solid'
}: ButtonProps) => (
  <button type={type} className={
    css(
      theme[color],
      styles[`${size}Size`],
      styles[`${variant}Variant`],
      styles.button,
      block && styles.block,
      disabled && styles.disabled
    )
  }>
    { children }
  </button>
)
