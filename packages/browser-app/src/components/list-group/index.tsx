import React, { useState } from 'react';
import styles from './index.module.css'
import Heading from '../heading'
import Avatars from '../avatars'
import { css } from '../../utils/css';

type TaskProps = {
  id: string,
  title: string,
  column: string,
  done?: boolean
}

const Task = (props: TaskProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragged, setIsDragged] = useState(false);
  return (
      <div
        onDragOver={(evt) => {
          evt.preventDefault();
          setIsHovered(true)
        }}
        onDragLeave={() => setIsHovered(false)}
        onDrop={() => setIsHovered(false)}
        className={css(styles.dragWrapper, isHovered && styles.isHovered)}
      >
        <header
          className={css(styles.wrapper, props.done && styles.done, isDragged && styles.isDragged)}
          onDragStart={() => setIsDragged(true)}
          onDragEnd={() => setIsDragged(false)}
          onDrop={() => console.log(props.id)}
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
          <Avatars images={[
            'http://placekitten.com/200/300',
            'http://placekitten.com/400/300',
            'http://placekitten.com/100/100'
          ]} />
        </header>
      </div>
    )
}

export default Task;