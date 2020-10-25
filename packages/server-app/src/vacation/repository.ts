import { ensureVacation } from './repository.types'
import { buildRepository } from '../utils/build-repository'
import { vacation, Vacation } from './use-cases'

export const ensure = buildRepository({
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
  toDomain: (dbResult) => {
    const decoded = vacation.decode(dbResult.jsonBuildObject?.valueOf())
    if (!decoded.isOk()) {
      throw new Error(JSON.stringify(decoded.get()))
    }
    return decoded.get()
  }
})
