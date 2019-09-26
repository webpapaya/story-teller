import React from 'react';
import { Link as ReactRouterLink } from 'react-router-dom'
import styles from './button.module.css'
import theme from './theme-colors.module.css'
import { css } from '../utils/css';

type LinkProps = {
  color?: 'primary' | 'secondary' | 'danger' | 'monochrome',
  size?: 'regular' | 'small'
  variant?: 'solid' | 'link' | 'outline'
  children: React.ReactNode,
  to: string,
  block?: boolean
  disabled?: boolean
}

export const Link = ({
  children,
  color = 'primary',
  size = 'regular',
  block = false,
  disabled = false,
  variant = 'solid',
  to,
}: LinkProps) => (
  <ReactRouterLink
    to={to}
    className={
      css(
        theme[color],
        styles[`${size}Size`],
        styles[`${variant}Variant`],
        styles.button,
        block && styles.block,
        disabled && styles.disabled
      )
    }
  >
    { children }
  </ReactRouterLink>
)
