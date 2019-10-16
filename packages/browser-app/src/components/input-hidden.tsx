import React, { useEffect } from 'react';

type InputProps = {
  name: string,
  defaultValue: any,
  onChange: (evt: React.FormEvent) => unknown
}

export const InputHidden = ({ name, defaultValue, onChange }: InputProps) => {
  useEffect(() => {
    onChange({
      preventDefault: () => {},
      target: { value: defaultValue, name }
    } as unknown as React.FormEvent)
  }, [])

  return (
    <input
      type="hidden"
      name={name}
      value={defaultValue}
    />
  )
}
