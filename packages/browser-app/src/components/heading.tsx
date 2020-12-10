import React from 'react';
import styles from './heading.module.css'
import { css } from '../utils/css';

type HeadingProps = {
  tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span'
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5'
  alignment?: 'left' | 'center'
  noMargin?: boolean,
  textDecoration?: 'none' | 'strikethrough'
  children: React.ReactNode,
}

const Heading = ({
  children,
  tagName = 'h1',
  variant = 'h1',
  textDecoration = 'none',
  alignment = 'left',
  noMargin = false
}: HeadingProps) => (
  React.createElement(tagName, {
    className: css(
      styles.default,
      styles[variant],
      styles[alignment],
      styles[`${textDecoration}TextDecoration`],
      noMargin && styles.noMargin
    )
  }, children)
)

export default Heading
