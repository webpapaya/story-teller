import { ensureVacation, IEnsureVacationResult, countVacation, whereIdVacation } from './repository.types'
import { buildRecordRepository } from '../lib/build-repository'
import { vacation, Vacation } from './use-cases'

const toDomain = (dbResult: IEnsureVacationResult) => {
  const decoded = vacation.decode(dbResult.jsonBuildObject?.valueOf())

  if (!decoded.isOk()) {
    throw new Error(JSON.stringify(decoded.get()))
  }
  return decoded.get()
}

export const ensure = buildRecordRepository({
  dbFunction: ensureVacation,
  toRepository: (vacation: Vacation) => {
    const answeredBy = vacation.request.state === 'confirmed' || vacation.request.state === 'rejected'
      ? vacation.request.answeredBy
      : null

    const reason = vacation.request.state === 'rejected'
      ? vacation.request.reason
      : null

    return {
      id: vacation.id,
      start_date: vacation.startDate,
      end_date: vacation.endDate,
      employee_id: vacation.employeeId,
      state: vacation.request.state,
      answered_by: answeredBy,
      reason
    }
  },
  toDomain
})

export const whereId = buildRecordRepository({
  dbFunction: whereIdVacation,
  toRepository: (params: {id: Vacation['id']}) => {
    return params
  },
  toDomain
})

export const count = buildRecordRepository({
  dbFunction: countVacation,
  toRepository: () => {
    return undefined
  },
  toDomain: (result) => {
    return result.count
  }
})
