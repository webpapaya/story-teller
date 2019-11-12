import React, { useEffect } from 'react';

type InputProps = {
  name: string,
  defaultValue: any,
  onChange: (evt: {
    preventDefault: () => void,
    target: { value: any, name: string, }
  }) => unknown
}

export const InputHidden = ({ name, defaultValue, onChange }: InputProps) => {
  useEffect(() => {
    onChange({
      preventDefault: () => {},
      target: { value: defaultValue, name }
    })
  }, [])

  return (
    <input
      type="hidden"
      name={name}
      value={defaultValue}
    />
  )
}
