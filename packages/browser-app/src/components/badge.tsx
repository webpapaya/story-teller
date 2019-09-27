import React from 'react';
import styles from './badge.module.css'
import { css } from '../utils/css';

type BadgeProps = {
  tagName?: 'section' | 'li'
  top: React.ReactNode,
  title: React.ReactNode,
  bottom: React.ReactNode
}

const Badge = ({ tagName = 'section', top, title, bottom }: BadgeProps) => (
  React.createElement(tagName, { className: styles.wrapper},
    <>
      <h2 className={css(styles.title)}>{title}</h2>
      <div className={css(styles.top)}>{top}</div>
      <div className={css(styles.bottom)}>{bottom}</div>
    </>
  )
)

export default Badge;