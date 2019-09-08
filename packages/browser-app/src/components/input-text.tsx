import React from 'react';
import styles from './input.module.css'

type InputProps = {
  label: string,
  name: string,
  value: any,
  onChange: (evt: React.FormEvent) => unknown
}

export const InputText = ({ name, value, onChange, label }: InputProps) => (
  <>
    <label className={styles.label} htmlFor={name}>
      { label }
    </label>

    <input
      className={styles.input}
      type="text"
      name={name}
      value={value}
      onChange={onChange}
    />
  </>
)
