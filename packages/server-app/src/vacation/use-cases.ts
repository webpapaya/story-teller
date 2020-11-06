import { v } from '@story-teller/shared'
import { principal } from '../principal'
import { aggregateFactory, useCase } from '../lib/use-case'

const personId = v.uuid

export const vacation = v.aggregate({
  id: v.uuid,
  startDate: v.date,
  endDate: v.date,
  employeeId: personId,
  request: v.union([
    v.record({
      state: v.literal('pending')
    }),
    v.record({
      state: v.literal('confirmed'),
      answeredBy: personId
    }),
    v.record({
      state: v.literal('rejected'),
      answeredBy: personId,
      reason: v.nonEmptyString
    }),
    v.record({
      state: v.literal('deleted'),
      reason: v.nullable(v.nonEmptyString)
    })
  ])
})
export type Vacation = typeof vacation['O']
export type RequestState = typeof vacation.schema.request.O['state']

export const commands = {
  request: v.record({
    id: v.uuid,
    employeeId: v.uuid,
    startDate: v.dateInFuture,
    endDate: v.dateInFuture
  }),
  confirm: v.record({
    id: v.uuid,
    principal: principal
  }),
  reject: v.record({
    id: v.uuid,
    reason: v.nonEmptyString,
    principal: principal
  }),
  delete: v.record({
    id: v.uuid,
    reason: v.nonEmptyString,
    principal: principal
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
  preCondition: ({ aggregate }) => {
    return aggregate.request.state === 'pending'
  },
  execute: ({ command, aggregate }) => {
    return {
      ...aggregate,
      request: {
        state: 'confirmed' as const,
        answeredBy: command.principal.id
      }
    }
  }
})

export const rejectRequest = useCase({
  aggregate: vacation,
  command: commands.reject,
  events: [],
  preCondition: ({ aggregate }) => {
    return aggregate.request.state === 'pending'
  },
  execute: ({ command, aggregate }) => {
    return {
      ...aggregate,
      request: {
        state: 'rejected' as const,
        reason: command.reason,
        answeredBy: command.principal.id
      }
    }
  }
})

export const deleteRequest = useCase({
  aggregate: vacation,
  command: commands.delete,
  events: [],
  preCondition: ({ aggregate }) => {
    return aggregate.request.state === 'pending'
  },
  execute: ({ command, aggregate }) => {
    return {
      ...aggregate,
      request: {
        state: 'deleted' as const,
        reason: command.reason
      }
    }
  }
})
