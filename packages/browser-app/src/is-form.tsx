import * as React from 'react'
import { AnyCodec } from '@story-teller/shared';

// Props you want the resulting component to take (besides the props of the wrapped component)
interface ExternalProps<A> {
    defaultValues?: Partial<A>,
    onSubmit?: (params: A) => Promise<void> | void
}

// Props the HOC adds to the wrapped component
export interface InjectedProps<A> {
    values: Partial<A>,
    onValueChange: (evt: FormEvent) => void,
    onSubmit: (evt: React.FormEvent) => void
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
  class HOC extends React.Component<OriginalProps & ExternalProps<A>, {values: Partial<A>, submitCount: number}> {
    constructor(props: OriginalProps & ExternalProps<A>) {
      super(props)
      this.state = {
        submitCount: 0,
        values: { ...options.defaultValues, ...props.defaultValues },
      }
    }

    onValueChange = (evt: FormEvent) => {
      evt.preventDefault()
      const value = evt.target.value;
      const name = evt.target.name;

      this.setState((state) => {
        const values = { ...state.values, [name]: value }
        const isPropValid = options.schema.decode(values).isOk()

        if (!isPropValid) { return state }
        return ({ ...state, values: { ...state.values, [name]: value } })
      })
    }

    onSubmit = (evt: React.FormEvent) => {
      evt.preventDefault()
      options.schema.decode(this.state.values)
        .fold(
          (test)=>{
            console.log(test)
          },
          async (values) => {
            if (this.props.onSubmit) {
              await this.props.onSubmit(values)
              this.setState({
                values: {
                  ...options.defaultValues,
                  ...this.props.defaultValues
                },
                submitCount: this.state.submitCount + 1
              })
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