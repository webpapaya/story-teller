import React, { ChangeEvent, FormEvent } from 'react';
import styles from './input.module.css'

type InputProps = {
  label: string,
  name: string,
  value: any,
  error?: string,
  onChange: (evt: ChangeEvent<HTMLInputElement>) => unknown,
  onFocus?: (evt: ChangeEvent<HTMLInputElement>) => unknown,
  onBlur?: (evt: ChangeEvent<HTMLInputElement>) => unknown
}

export const InputPassword = ({ name, error, value, onChange, label, onBlur, onFocus }: InputProps) => (
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
      onFocus={onFocus}
      onBlur={onBlur}
    />
    {error && (<span className={styles.error}>{error}</span>)}
  </>
)
