import * as React from 'react'
import * as v from 'validation.ts';

// Props you want the resulting component to take (besides the props of the wrapped component)
interface ExternalProps<A> {
    defaultValues?: Partial<A>,
    onSubmit?: (params: A) => Promise<void> | void
}

// Props the HOC adds to the wrapped component
export interface InjectedProps<A> {
    values: Partial<A>,
    onValueChange: (evt: React.FormEvent) => void,
    onSubmit: (evt: React.FormEvent) => void
}

// Options for the HOC factory that are not dependent on props values
interface Options<A> {
  schema: v.Validator<A>,
  defaultValues?: Partial<A>
}

const isForm = <A, OriginalProps extends {}>(options: Options<A>,
  Component: React.ComponentType<OriginalProps & InjectedProps<A>>,
) => {
  class HOC extends React.Component<OriginalProps & ExternalProps<A>, {values: Partial<A>, submitCount: number}> {
    constructor(props: OriginalProps & ExternalProps<A>) {
      super(props)
      this.state = {
        submitCount: 0,
        values: { ...options.defaultValues, ...props.defaultValues },
      }
    }

    onValueChange = (evt: React.FormEvent) => {
      evt.preventDefault()
      // @ts-ignore
      const value = evt.target.value;
      // @ts-ignore
      const name = evt.target.name;

      this.setState((state) => {
        const values = { ...state.values, [name]: value }
        const isPropValid = options.schema.validate(values)
          .fold(
            (errors) => !errors.some((error) => error.context.endsWith(name)),
            () => true
          )
        if (!isPropValid) { return state }
        return ({ ...state, values: { ...state.values, [name]: value } })
      })
    }

    onSubmit = (evt: React.FormEvent) => {
      evt.preventDefault()
      options.schema.validate(this.state.values)
        .fold(
          (test)=>{
            console.log(test)
          },
          async (values) => {
            if (this.props.onSubmit) {
              await this.props.onSubmit(values)
              this.setState({ submitCount: this.state.submitCount + 1 })
            }
          })
    }

    render() {
      return (
        <Component
          {...this.props}
          key={this.state.submitCount}
          onSubmit={this.onSubmit}
          values={this.state.values}
          onValueChange={this.onValueChange}
        />
      )
    }
  }

  return HOC
}

export default isForm