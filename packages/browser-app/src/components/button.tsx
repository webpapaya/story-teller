import React from 'react';
import styles from './button.module.css'
import theme from './theme-colors.module.css'
import { css } from '../utils/css';

type ButtonProps = {
  color?: 'primary' | 'secondary' | 'danger' | 'monochrome',
  size?: 'regular' | 'small'
  variant?: 'solid' | 'link' | 'outline'
  children: React.ReactNode,
  onClick?: () => any
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  disabled?: boolean
  marginBottom?: boolean
  usesGridArea?: boolean,
  state?: "enabled" | "disabled" | "pending"
}

export const Button = ({
  children,
  type='submit',
  color = 'primary',
  size = 'regular',
  block = false,
  disabled = false,
  variant = 'solid',
  marginBottom = false,
  onClick,
  usesGridArea,
  state = "enabled"
}: ButtonProps) => {
  const isDisabled = disabled || state !== 'enabled'

  return (
    <button
      type={type}
      style={usesGridArea ? { gridArea: type } : {}}
      onClick={onClick}
      disabled={isDisabled}
      className={
        css(
          theme[color],
          styles[`${size}Size`],
          styles[`${variant}Variant`],
          styles.button,
          block && styles.block,
          isDisabled && styles[state],
          marginBottom && styles.marginBottom
        )
      }
    >
      { children }
    </button>
  )
}
