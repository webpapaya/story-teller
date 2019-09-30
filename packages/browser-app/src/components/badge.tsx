import React from 'react';
import styles from './badge.module.css'
import { css } from '../utils/css';

type BadgeProps = {
  tagName?: 'section' | 'li'
  topLeft?: React.ReactNode,
  bottomLeft?: React.ReactNode,
  topRight?: React.ReactNode,
  bottomRight?: React.ReactNode,
  title: React.ReactNode,
}

const Badge = ({
  tagName = 'section',
  topLeft,
  topRight,
  bottomLeft,
  bottomRight,
  title
}: BadgeProps) => (
  React.createElement(tagName, { className: styles.wrapper},
    <>
      <h2 className={css(styles.title)}>{title}</h2>
      { topLeft && <div className={css(styles.topLeft)}>{topLeft}</div> }
      { topRight && <div className={css(styles.topRight)}>{topRight}</div> }
      { bottomLeft && <div className={css(styles.bottomLeft)}>{bottomLeft}</div> }
      { bottomRight && <div className={css(styles.bottomRight)}>{bottomRight}</div> }
    </>
  )
)

export default Badge;