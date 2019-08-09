import { DayPart } from './domain'

const sortDayParts = (dayPoints: DayPart[]) => {
  return dayPoints.sort((a, b) => {
    return a.offset - b.offset || a.priority - b.priority
  })
}

export const combineDayParts = (days: DayPart[]) => {
  const dayPoints = sortDayParts([...days])
  const result: DayPart[] = []

  let currentDayPoint: DayPart | undefined
  while (currentDayPoint = dayPoints.shift()) { // eslint-disable-line no-cond-assign
    const currentDay = currentDayPoint
    const previousDay = result[result.length - 1]
    const needsToBeReplaced = previousDay && currentDay.offset === previousDay.offset

    if (!previousDay) {
      result.push(currentDay)
      continue
    } else if (needsToBeReplaced) {
      result[result.length - 1] = currentDay
    } else if (currentDay.duration > 0) {
      result.push(currentDay)
    }

    const currentDayEnd = currentDay.offset + currentDay.duration
    const previousDayEnd = previousDay.offset + previousDay.duration
    const nextDuration = previousDayEnd - currentDayEnd

    if (previousDayEnd > currentDay.offset) {
      previousDay.duration = currentDayPoint.offset - previousDay.offset
    }

    if (previousDayEnd > currentDayEnd) {
      dayPoints.push({ ...previousDay, offset: currentDayEnd, duration: nextDuration })
      sortDayParts(dayPoints)
    }
  }

  return result
}
