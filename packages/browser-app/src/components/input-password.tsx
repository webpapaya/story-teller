import React, { ChangeEvent } from 'react';
import styles from './input.module.css'

type InputProps = {
  label: string,
  name: string,
  value: any,
  error?: string,
  onChange: (evt: ChangeEvent<HTMLInputElement>) => unknown
}

export const InputPassword = ({ name, error, value, onChange, label }: InputProps) => (
  <>
    <label className={styles.label} htmlFor={name}>
      { label }
    </label>
    <input
      type="password"
      className={styles.input}
      name={name}
      value={value}
      onChange={onChange}
    />
    {error && (<span className={styles.error}>{error}</span>)}
  </>
)
