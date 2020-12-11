import React, { ChangeEvent, FormEvent } from 'react';
import { css } from '../utils/css';
import styles from './input.module.css'

type InputProps = {
  label: string,
  name: string,
  value: any,
  error?: string,
  onChange: (evt: ChangeEvent<HTMLInputElement>) => unknown,
  onFocus?: (evt: ChangeEvent<HTMLInputElement>) => unknown,
  onBlur?: (evt: ChangeEvent<HTMLInputElement>) => unknown
  usesGridArea?: boolean
}

export const InputDate = ({
  name,
  error,
  value,
  onChange,
  label,
  onBlur,
  onFocus,
  usesGridArea
}: InputProps) => (
  <>
    <label style={usesGridArea ? { gridArea: name } : {}}>
      <span className={styles.label}>{ label }</span>
      <input
        type="date"
        className={css(
          styles.input,
          error && styles.inputError
        )}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      {error && (<span className={styles.error}>{error}</span>)}
    </label>
  </>
)
