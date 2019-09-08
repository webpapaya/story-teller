import React from 'react';
import styles from './input.module.css'

type InputProps = {
  label: string,
  name: string,
  value: any,
  onChange: (evt: React.FormEvent) => unknown
}

export const InputTextarea = ({ name, value, onChange, label }: InputProps) => (
  <>
    <label className={styles.label} htmlFor={name}>
      { label }
    </label>

    <textarea
      className={styles.input}
      name={name}
      value={value}
      onChange={onChange}
    />
  </>
)
