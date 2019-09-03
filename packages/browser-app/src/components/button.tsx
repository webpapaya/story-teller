import React from 'react';
import styles from './button.module.css'
import { css } from '../utils/css';

type ButtonProps = {
  children: React.ReactNode,
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
}

export const Button = ({ children, type='submit', block }: ButtonProps) => (
  <button type={type} className={
    css(styles.button, block && styles.block)
  }>
    { children }
  </button>
)
