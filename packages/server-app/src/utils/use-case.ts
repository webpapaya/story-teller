import { AnyCodec } from '@story-teller/shared'

export const useCaseWithoutAggregate = <
  Action extends AnyCodec,
  Aggregate extends AnyCodec,
  Result
>(options: {
  action: Action,
  aggregate: Aggregate,
  preCondition?: (opts: { action: Action['O'] }) => boolean,
  execute: (opts: { action: Action['O'] }) => Result
}) => (
  payload: { action: Action['O'] },
): Aggregate['O'] => {
  if(!options.action.is(payload.action)) {
    throw new Error('Invalid Action')
  }

  if(options.preCondition && !options.preCondition(payload)) {
    throw new Error('Invalid Precondition')
  }

  const updatedAggregate = options.execute(payload)

  if(!options.aggregate.is(updatedAggregate)) {
    throw new Error('Aggregate invalid after use case')
  }

  return updatedAggregate
}

export const useCase = <
  Action extends AnyCodec,
  Aggregate extends AnyCodec
>(options: {
  action: Action,
  aggregate: Aggregate,
  preCondition?: (opts: { aggregate: Aggregate['O'], action: Action['O'] }) => boolean,
  execute: (opts: { aggregate: Aggregate['O'], action: Action['O'] }) => Aggregate['O']
}) => (
  payload: {
    action: Action['O'],
    aggregate: Aggregate['O'],
  }
): Aggregate['O'] => {
  if(!options.action.is(payload.action)) {
    throw new Error('Invalid Action')
  }

  if(!options.aggregate.is(payload.aggregate)) {
    throw new Error('Invalid Aggregate')
  }

  if(options.preCondition && !options.preCondition(payload)) {
    throw new Error('Invalid Precondition')
  }

  const updatedAggregate = options.execute(payload)

  if(!options.aggregate.is(updatedAggregate)) {
    throw new Error('Aggregate invalid after use case')
  }

  return updatedAggregate
}