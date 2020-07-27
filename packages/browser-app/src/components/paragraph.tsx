import React from 'react';
import styles from './paragraph.module.css'
import { css } from '../utils/css';

type ParagraphProps = {
  tagName?: 'p' | 'span'
  children: React.ReactNode,
}

const Paragraph = ({
  children,
  tagName = 'p',
}: ParagraphProps) => (
  React.createElement(tagName, {
    className: css(styles.default)
  }, children)
)

export default Paragraph
