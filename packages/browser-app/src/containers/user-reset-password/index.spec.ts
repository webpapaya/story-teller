import { allOf, assertThat, hasProperty } from 'hamjest'
import { OwnPropsType } from './types'
import { AppState } from '../../domain/types'
import { mapStateToProps } from './index'
import { aroundInvoke } from '../../utils/around-invoke'

describe('mapStateToProps', () => {
  it('WHEN location is set', () => {
    aroundInvoke({
      before: () => {
        // @ts-ignore
        global.location = {
          search: '?id=id&token=token'
        }
      },
      after: () => {
        // @ts-ignore
        delete global.location
      },
      execute: () => {
        assertThat(mapStateToProps(
          {} as unknown as AppState,
          {} as unknown as OwnPropsType), allOf(
          hasProperty('defaultValues.id', 'id'),
          hasProperty('defaultValues.token', 'token')))
      }
    })
  })
})
