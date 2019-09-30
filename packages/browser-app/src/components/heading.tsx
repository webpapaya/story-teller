import React from 'react';
import styles from './heading.module.css'
import { css } from '../utils/css';

type HeadingProps = {
  tagName?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  variant?: 'h1' | 'h2' | 'h3' | 'h4'
  noMargin?: boolean,
  children: React.ReactNode,
}

const Heading = ({
  children,
  tagName = 'h1',
  variant = 'h1',
  noMargin = false
}: HeadingProps) => (
  React.createElement(tagName, {
    className: css(styles.default, styles[variant], noMargin && styles.noMargin)
  }, children)
)

export default Heading
