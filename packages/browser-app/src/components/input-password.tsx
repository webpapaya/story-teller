import React from 'react';
import styles from './input.module.css'

type InputProps = {
  name: string,
  value: any,
  onChange: (evt: React.FormEvent) => unknown
}

export const InputPassword = ({ name, value, onChange }: InputProps) => (
  <input
    type="password"
    className={styles.input}
    name={name}
    value={value}
    onChange={onChange}
  />
)
