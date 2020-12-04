import { assertThat, hasProperties, equalTo, hasProperty } from 'hamjest'
import { reactionsToTree } from './reactions-to-tree'

describe('reactionsToTree', () => {
  it('converts an empty array to an empty list', () => {
    assertThat(reactionsToTree([]), equalTo([]))
  })

  it('adds a side effect without targets', () => {
    assertThat(reactionsToTree([{ useCaseFrom: 'useCase1', event: '' }]),
      hasProperty('0', hasProperty('sideEffects', equalTo([]))))
  })

  it('adds a two side effects without targets', () => {
    const reactions = [
      { useCaseFrom: 'useCase1', event: '' },
      { useCaseFrom: 'useCase2', event: '' }
    ]
    assertThat(reactionsToTree(reactions), hasProperties({
      0: hasProperty('useCaseFrom', reactions[0].useCaseFrom),
      1: hasProperty('useCaseFrom', reactions[1].useCaseFrom)
    }))
  })

  it('converts nested reactions', () => {
    const reactions = [
      { useCaseFrom: 'useCase1', event: '' },
      { useCaseFrom: 'useCase2', event: '', useCaseTo: 'useCase1' },
      { useCaseFrom: 'useCase3', event: '', useCaseTo: 'useCase2' }
    ]

    assertThat(reactionsToTree(reactions),
      hasProperty('0.sideEffects.0.sideEffects.0.useCaseFrom',
        equalTo(reactions[2].useCaseFrom)))
  })
})
