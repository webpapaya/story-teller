import { assertThat, hasProperty, throws } from 'hamjest'
import uuid from 'uuid'
import { hasAggregate } from '../utils/custom-matcher'
import { commands, requestVacation, vacation, confirmRequest, requestingUser, rejectRequest, deleteRequest } from './use-cases'

describe('vacation', () => {
  describe('requestVacation', () => {
    it('returns VACATION in pending state', () => {
      const resultingAggregate = requestVacation.run({
        aggregate: undefined,
        command: commands.request.build()[0]()
      })

      assertThat(resultingAggregate,
        hasAggregate(hasProperty('request.state', 'pending')))
    })
  })

  describe('confirmVacation', () => {
    const executeUseCase = (params: {role: 'manager' | 'user' }) => {
      const aggregate = {
        ...vacation.build()[0](),
        request: { state: 'pending' as const }
      }
      const command = {
        ...commands.confirm.build()[0](),
        requestingUser: {
          ...requestingUser.build()[0](),
          role: params.role
        }
      }


      const result = confirmRequest.run({ command, aggregate })

      return { command, result }
    }

    describe('WHEN vacation is pending', () => {
      it('changes state to confirmed', () => {
        const { command, result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.state', 'confirmed')))
      })

      it('AND sets confirmed by', () => {
        const { command, result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.answeredBy', command.requestingUser.id)))
      })
    })


  })

  describe('rejectVacation', () => {
    const executeUseCase = (params: {role: 'manager' | 'user' }) => {
      const aggregate = {
        ...vacation.build()[0](),
        request: { state: 'pending' as const }
      }
      const command = {
        ...commands.reject.build()[0](),
        requestingUser: {
          ...requestingUser.build()[0](),
          role: params.role
        }
      }

      const result = rejectRequest.run({ command, aggregate })

      return { command, result }
    }

    describe('WHEN vacation is pending', () => {
      it('changes state to confirmed', () => {
        const { result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.state', 'rejected')))
      })

      it('AND sets confirmed by', () => {
        const { command, result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.answeredBy', command.requestingUser.id)))
      })

      it('AND sets reason', () => {
        const { command, result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.reason', command.reason)))
      })
    })
  })

  describe('deleteVacation', () => {
    context('WHEN user is employee of vacation', () => {
      it('sets vacation to deleted', () => {
        const aggregate = {
          ...vacation.build()[0](),
          request: { state: 'pending' as const }
        }

        const command = {
          ...commands.delete.build()[0](),
          requestingUser: {
            ...requestingUser.build()[0](),
            id: aggregate.employeeId
          }
        }

        assertThat(deleteRequest.run({ command, aggregate }),
          hasAggregate(hasProperty('request.state', 'deleted')))
      })

      context('WHEN vacation was already approved', () => {
        it('throws error', () => {
          const aggregate = {
            ...vacation.build()[0](),
            request: {
              state: 'confirmed' as const,
              answeredBy: uuid()
            }
          }

          const command = {
            ...commands.delete.build()[0](),
            requestingUser: {
              ...requestingUser.build()[0](),
              id: aggregate.employeeId
            }
          }

          assertThat(() => deleteRequest.run({ command, aggregate }),
            throws());
        })
      })
    })
  })
})