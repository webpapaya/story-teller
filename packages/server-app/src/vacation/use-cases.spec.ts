import { assertThat, hasProperty, throws } from 'hamjest'
import { hasAggregate } from '../utils/custom-matcher'
import { commands, requestVacation, vacation, confirmRequest, requestingUser, rejectRequest } from './use-cases'

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

    describe('WHEN confirmer is manager', () => {
      it('changes state to confirmed', () => {
        const { command, result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.state', 'confirmed')))
      })

      it('AND sets confirmed by', () => {
        const { command, result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.confirmedBy', command.requestingUser.id)))
      })
    })

    describe('WHEN confirmer is user', () => {
      it('throws invalid precondition error', () => {
        assertThat(() => executeUseCase({ role: 'user' }), throws())
      })
    })
  })

  describe.only('rejectVacation', () => {
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

    describe('WHEN confirmer is manager', () => {
      it('changes state to confirmed', () => {
        const { result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.state', 'rejected')))
      })

      it('AND sets confirmed by', () => {
        const { command, result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.confirmedBy', command.requestingUser.id)))
      })

      it('AND sets reason', () => {
        const { command, result } = executeUseCase({ role: 'manager' })
        assertThat(result,
          hasAggregate(hasProperty('request.reason', command.reason)))
      })
    })

    describe('WHEN confirmer is user', () => {
      it('throws invalid precondition error', () => {
        assertThat(() => executeUseCase({ role: 'user' }), throws())
      })
    })
  })
})