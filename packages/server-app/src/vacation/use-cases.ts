import { v } from '@story-teller/shared'
import {  } from '@story-teller/shared/dist'
import { aggregateFactory, useCase } from '../lib/use-case'

const personId = v.uuid
export const requestingUser = v.record({
  id: personId,
  role: v.union([v.literal('user'), v.literal('manager')])
})
export const vacation = v.aggregate({
  id: v.uuid,
  startDate: v.date,
  endDate: v.date,
  request: v.union([
    v.record({
      state: v.literal('pending')
    }),
    v.record({
      state: v.literal('confirmed'),
      confirmedBy: personId,
    })
  ])
})

export const commands = {
  request: v.record({
    id: v.uuid,
    employeeId: v.uuid,
    startDate: v.dateInFuture,
    endDate: v.dateInFuture
  }),
  confirm: v.record({
    id: v.uuid,
    requestingUser: requestingUser,
  })
} as const

export const requestVacation = aggregateFactory({
  aggregateFrom: v.undefinedCodec,
  aggregateTo: vacation,
  command: commands.request,
  events: [],
  execute: ({ command }) => {
    return {
      ...command,
      request: {
        state: 'pending' as const
      }
    }
  }
})

export const confirmRequest = useCase({
  aggregate: vacation,
  command: commands.confirm,
  events: [],
  preCondition: ({ command }) => {
    return command.requestingUser.role === 'manager'
  },
  execute: ({ command, aggregate }) => {
    return {
      ...aggregate,
      request: {
        state: 'confirmed' as const,
        confirmedBy: command.requestingUser.id
      }
    }
  }
})