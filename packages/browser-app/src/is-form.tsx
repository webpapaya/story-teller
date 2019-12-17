import * as React from 'react'
import { AnyCodec } from '@story-teller/shared';
import objectKeys from './utils/object-keys'

// Props you want the resulting component to take (besides the props of the wrapped component)
interface ExternalProps<A extends AnyCodec> {
    defaultValues?: Partial<A['O']>,
    onSubmit?: (params: A) => Promise<void> | void
}

type ValidationError = { message: string, context: { path: string }}

// Props the HOC adds to the wrapped component
export interface InjectedProps<A extends object> {
    onSubmit: (evt: React.FormEvent) => void,
    fields: {
      [key in keyof A]: {
        value: any,
        error?: string,
        onBlur: (evt: FormEvent) => {}
        onFocus: (evt: FormEvent) => {}
        onChange: (evt: FormEvent) => {}
      }
    }
}

// Options for the HOC factory that are not dependent on props values
interface Options<A extends AnyCodec> {
  schema: A,
  defaultValues?: Partial<A['O']>
}

type FormEvent = {
  preventDefault: () => void
  target: {
    value: any,
    name: string
  }
}

const isForm = <A extends AnyCodec, OriginalProps extends {}>(options: Options<A>,
  Component: React.ComponentType<OriginalProps & InjectedProps<A['O']>>,
) => {
  class HOC extends React.Component<OriginalProps & ExternalProps<A>, {
    touchedFields: (keyof A['O'])[],
    values: Partial<A>,
    submitCount: number,
    errors: ValidationError[]
}> {
    constructor(props: OriginalProps & ExternalProps<A>) {
      super(props)
      this.state = {
        submitCount: 0,
        values: { ...options.defaultValues, ...props.defaultValues },
        errors: [],
        touchedFields: [],
      }
    }

    onValueChange = (evt: FormEvent) => {
      evt.preventDefault()
      const value = evt.target.value;
      const name = evt.target.name;

      this.setState((state) => {
        const values = { ...state.values, [name]: value }
        const validationResult = options.schema.decode(values)
        const errors = validationResult.isOk()
          ? []
          : validationResult.get()

        return ({ ...state, errors, values })
      })
    }

    onFieldBlur = (evt: FormEvent) => {
      const name = evt.target.name;
      const touchedFields = Array.from(new Set([...this.state.touchedFields, name as keyof A]))
      this.setState({ touchedFields })
    }

    onFieldFocus = (evt: FormEvent) => {
      const name = evt.target.name;
      const touchedFields = this.state.touchedFields.filter((v) => v !== name)
      this.setState({ touchedFields })
    }

    onSubmit = (evt: React.FormEvent) => {
      evt.preventDefault()
      options.schema.decode(this.state.values)
        .fold(
          (errors) => this.setState({ errors }),
          async (values) => {
            if (this.props.onSubmit) {
              await this.props.onSubmit(values)
              this.setState({
                values: {
                  ...options.defaultValues,
                  ...this.props.defaultValues
                },
                touchedFields: [],
                submitCount: this.state.submitCount + 1
              })
            }
          })
    }

    get errors() {
      return this.state.errors.reduce((result, error) => {
        const name = error.context.path.replace('$.', '')
        if (this.state.touchedFields.includes(name)) {
          // @ts-ignore
          result[error.context.path.replace('$.', '')] = error.message
        }
        return result
      }, {} as { [key in keyof A['O']]: string })
    }

    get fields() {
      return objectKeys(options.schema.toJSON().properties).reduce((result, key: keyof A['O']) => {
        result[key] = {
          value: this.state.values[key],
          error: this.errors[key],
          onBlur: this.onFieldBlur,
          onFocus: this.onFieldFocus,
          onChange: this.onValueChange
        }
        return result
      }, {} as { [key in keyof A['O']]: any })
    }

    render() {
      return (
        <Component
          {...this.props}
          key={this.state.submitCount}
          fields={this.fields}
          onSubmit={this.onSubmit}
        />
      )
    }
  }

  return HOC
}

export default isForm