import { ensureVacation, IEnsureVacationResult, countVacation, whereIdVacation } from './repository.types'
import { buildRecordRepository, buildRepository } from '../utils/build-repository'
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
    const confirmedBy = vacation.request.state !== 'pending'
      ? vacation.request.confirmedBy
      : null

    const reason = vacation.request.state === 'rejected'
      ? vacation.request.reason
      : null

    return {
      id: vacation.id,
      start_date: vacation.startDate,
      end_date: vacation.endDate,
      person_id: vacation.id,
      state: vacation.request.state,
      confirmed_by: confirmedBy,
      reason
    }
  },
  toDomain
})

export const whereId = buildRepository({
  dbFunction: whereIdVacation,
  toRepository: (params: {id: Vacation['id']}) => {
    return params
  },
  toDomain
})

export const count = buildRecordRepository({
  dbFunction: countVacation,
  toRepository: () => {
    return void 0
  },
  toDomain: (result) => {
    return result.count
  }
})