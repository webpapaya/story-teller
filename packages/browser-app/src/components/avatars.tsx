import React from 'react';
import styles from './avatars.module.css';
import { css } from '../utils/css';

type AvatarsProps = {
  images: string[]
}

const Avatars = (props: AvatarsProps) => (
    <div className={css(styles.wrapper)}>
      { props.images.map((imageUrl) => (
        <img src={imageUrl} className={css(styles.image)} />
      ))}
    </div>
)

export default Avatars;