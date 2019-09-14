import React from 'react';
import styles from './input.module.css'

type InputProps = {
  label: string,
  name: string,
  value?: any,
  onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => unknown
  onKeyDown?: (evt: React.KeyboardEvent<HTMLInputElement>) => unknown
  focus?: boolean,
}

export const InputText = React.forwardRef<HTMLInputElement, InputProps>(({ name, value, onChange, label , onKeyDown}, ref) => {
  return (
      <>
        <label className={styles.label} htmlFor={name}>
          { label }
        </label>

        <input
          ref={ref}
          className={styles.input}
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
        />
      </>
  )
})
