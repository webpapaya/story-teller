import React from 'react';
import styles from './message.module.css'
import { css } from '../utils/css';

type BadgeProps = {
  children: React.ReactNode,
  variant?: 'error' | 'success'
}

export const Message = ({
  children,
  variant = 'error'
}: BadgeProps) => (
  <div className={css(styles.default, styles[variant])}>
    {children}
  </div>
)

export default Message;