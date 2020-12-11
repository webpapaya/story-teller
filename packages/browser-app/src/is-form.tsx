import * as React from 'react'
import { AnyCodec } from '@story-teller/shared';
import objectKeys from './utils/object-keys'
import { APIError } from './domain/errors';

// Props you want the resulting component to take (besides the props of the wrapped component)
interface ExternalProps<A extends AnyCodec> {
    defaultValues?: Partial<A['O']>,
    onSubmit?: (params: A['O']) => Promise<void> | void
}

type ValidationError = { message: string, context: { path: string }}
type ButtonState = "pending" | "disabled"  | "enabled"

// Props the HOC adds to the wrapped component
export interface InjectedProps<A extends object> {
    submissionError?: APIError
    onSubmit: (evt: React.FormEvent) => void,
    submitButton: {
      type: "submit",
      state: ButtonState
    },
    fields: {
      [key in keyof A]: {
        value: any,
        error?: string,
        onBlur: (evt: FormEvent) => {}
        onFocus: (evt: FormEvent) => {}
        onChange: (evt: FormEvent) => {},
        name: string,
      }
    }
}

// Options for the HOC factory that are not dependent on props values
interface Options<A extends AnyCodec> {
  schema: A,
  initialValues?: Partial<A['O']>
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
    values: Partial<A['O']>,
    submitCount: number,
    errors: ValidationError[],
    submissionError?: APIError,
    submitButtonState: ButtonState
}> {
    constructor(props: OriginalProps & ExternalProps<A>) {
      super(props)
      const values = {
        ...options.initialValues,
        ...props.defaultValues
      } as Partial<A['O']>


      this.state = {
        submitCount: 0,
        values: values,
        errors: [],
        touchedFields: [],
        submitButtonState: options.schema.is(values) ? "enabled" : "disabled"
      }
    }

    onValueChange = (evt: FormEvent) => {
      evt.preventDefault()
      const value = evt.target.value;
      const name = evt.target.name;

      this.setState((state) => {
        const values = { ...state.values, [name]: value }
        const errors = this.getValidationErrors(values)

        return ({
          ...state,
          errors,
          values,
          submitButtonState: this.getSubmitButtonState(errors)
        })
      })
    }

    onFieldBlur = (evt: FormEvent) => {
      const name = evt.target.name;
      const touchedFields = Array.from(new Set([...this.state.touchedFields, name as keyof A]))
      this.setState({ touchedFields })
    }

    getValidationErrors = (
      vals: Partial<A['O']>,
      nextVals: Partial<A['O']> = {}
    ) => {
      const values = { ...vals, ...nextVals }
      const validationResult = options.schema.decode(values)
      return validationResult.isOk()
        ? []
        : validationResult.get()
    }

    getSubmitButtonState = (errors: ValidationError[]) => {
      return errors.length ? 'disabled' : 'enabled'
    }

    onFieldFocus = (evt: FormEvent) => {
      const name = evt.target.name;
      const touchedFields = this.state.touchedFields.filter((v) => v !== name)
      this.setState({ touchedFields })
    }

    onSubmit = async (evt: React.FormEvent) => {
      evt.preventDefault()
      const decoded = options.schema.decode(this.state.values)
      this.setState({ submitButtonState: 'pending' })
      if (!decoded.isOk()) {
        this.setState({ errors: decoded.get() })
        return
      }

      if (!this.props.onSubmit) { return }

      const values = decoded.get()

      try {
        await this.props.onSubmit(values)
        const nextValues = {
          ...options.initialValues,
          ...this.props.defaultValues
        }

        this.setState({
          values: nextValues,
          touchedFields: [],
          submitCount: this.state.submitCount + 1,
          submitButtonState: this.getSubmitButtonState(
            this.getValidationErrors(nextValues))
        })
      } catch (submissionError) {
        this.setState({
          submissionError: submissionError,
          submitButtonState: this.getSubmitButtonState(
            this.getValidationErrors(this.state.errors))
        })
      }
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
      return objectKeys(options.schema.toJSON().properties).reduce((result, name: keyof A['O']) => {
        result[name] = {
          value: this.state.values[name],
          error: this.errors[name],
          onBlur: this.onFieldBlur,
          onFocus: this.onFieldFocus,
          onChange: this.onValueChange,
          name: name,
        }
        return result
      }, {} as { [key in keyof A['O']]: any })
    }

    render() {
      return (
        <Component
          {...this.props}
          submitButton={{
            type: 'submit',
            state: this.state.submitButtonState
          }}
          submissionError={this.state.submissionError}
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