import React, { useState } from 'react';
import styles from './index.module.css'
import Heading from '../../../components/heading'
import { css } from '../../../utils/css';

type ListItem = {
  id: string,
  title: string,
  column: string,
  done?: boolean
}

const Task = (props: ListItem) => {
  return (
    <header
      className={css(styles.wrapper, props.done && styles.done)}
      draggable
    >
      <Heading
        variant="h3"
        textDecoration={ props.done ? "strikethrough" : 'none' }
        noMargin
      >
        {props.title}
      </Heading>
      <div className={css(styles.chip)}>{props.column}</div>
    </header>
    )
}

export default Task;