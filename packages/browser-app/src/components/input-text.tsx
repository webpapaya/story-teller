import React from 'react';
import styles from './input.module.css'

type InputProps = {
  name: string,
  value: any,
  onChange: (evt: React.FormEvent) => unknown
}

export const InputText = ({ name, value, onChange }: InputProps) => (
  <input
    className={styles.input}
    type="text"
    name={name}
    value={value}
    onChange={onChange}
  />
)
