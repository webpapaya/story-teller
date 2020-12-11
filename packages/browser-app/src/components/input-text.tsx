import React from 'react';
import styles from './input.module.css'
import { css } from '../utils/css';

type InputProps = {
  label: string,
  name: string,
  value?: any,
  onChange?: (evt: React.ChangeEvent<HTMLInputElement>) => unknown,
  onKeyDown?: (evt: React.KeyboardEvent<HTMLInputElement>) => unknown
  onFocus?: (evt: React.ChangeEvent<HTMLInputElement>) => unknown,
  onBlur?: (evt: React.ChangeEvent<HTMLInputElement>) => unknown
  focus?: boolean,
  error?: string,
  variant?: 'form' | 'title',
  usesGridArea?: boolean
}

export const InputText = React.forwardRef<HTMLInputElement, InputProps>(({
  name,
  value,
  onChange,
  label ,
  onKeyDown,
  error,
  variant='form',
  onFocus,
  onBlur,
  usesGridArea
}, ref) => {
  switch(variant) {
    case 'title': return (
      <input
          ref={ref}
          className={css(
            styles.input,
            styles.variantTitle,
          )}
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          placeholder={label}
          onFocus={onFocus}
          onBlur={onBlur}
        />
    )
    case 'form': return (
      <>
        <label style={usesGridArea ? { gridArea: name } : {}}>
          <span className={styles.label}></span>
          <input
            ref={ref}
            className={css(
              styles.input,
              error && styles.inputError
            )}
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
          />
          {error && (<span className={styles.error}>{error}</span>)}
        </label>
      </>
    )
  }
})
