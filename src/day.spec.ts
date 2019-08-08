// @ts-ignore
import { assertThat, hasProperties, hasProperty } from 'hamjest'
import * as Factory from 'factory.ts'
import { Day } from './domain'

const sortDayPoints = (dayPoints: Day[]) => {
  return dayPoints.sort((a, b) => {
    return a.offset - b.offset || a.priority - b.priority
  })
}

const calculateDayKind = (days: Day[]) => {
  const dayPoints = sortDayPoints([...days])
  const result: Day[] = []

  let currentDayPoint: Day | undefined
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
    previousDay.duration = currentDayPoint.offset - previousDay.offset

    if (previousDayEnd > currentDayEnd) {
      dayPoints.push({ ...previousDay, offset: currentDayEnd, duration: nextDuration })
      sortDayPoints(dayPoints)
    }
  }

  return result
}

const dayFactory = Factory.Sync.makeFactory<Day>({
  offset: 0,
  duration: 1,
  type: 'daykind',
  priority: 0
})

describe('calculateDayKind', () => {
  it('single full day is returned as is', () => {
    assertThat(calculateDayKind([dayFactory.build()]),
      hasProperty('length', 1))
  })

  it('two full days, returns 1 day part', () => {
    assertThat(calculateDayKind([
      dayFactory.build({ }),
      dayFactory.build({ }),
    ]), hasProperty('length', 1))
  })

  it('half day (prio 0) and full day (prio 1), returns 2 day parts', () => {
    assertThat(calculateDayKind([
      dayFactory.build({ priority: 0 }),
      dayFactory.build({ priority: 1, duration: 0.5 })
    ]), hasProperty('length', 2))
  })

  it('half day (prio 1) and full day (prio 0), returns 1 day part', () => {
    assertThat(calculateDayKind([
      dayFactory.build({ priority: 1 }),
      dayFactory.build({ priority: 0, duration: 0.5 })
    ]), hasProperty('length', 1))
  })

  it('full day (prio 0) and half day (prio 1) at the end, returns 2 day parts', () => {
    assertThat(calculateDayKind([
      dayFactory.build({ priority: 1, offset: 0.5, duration: 0.5, type: 'B' }),
      dayFactory.build({ priority: 0, offset: 0, type: 'A' })
    ]), hasProperties({
      length: 2,
      0: hasProperties({ type: 'A', offset: 0, duration: 0.5 }),
      1: hasProperties({ type: 'B', offset: 0.5, duration: 0.5 })
    }))
  })

  it('full day (prio 0) and half day (prio 1) in the middle, returns 3 day parts', () => {
    assertThat(calculateDayKind([
      dayFactory.build({ priority: 1, offset: 0.25, duration: 0.5, type: 'B' }),
      dayFactory.build({ priority: 0, type: 'A' })
    ]), hasProperties({
      length: 3,
      0: hasProperties({ type: 'A', offset: 0, duration: 0.25 }),
      1: hasProperties({ type: 'B', offset: 0.25, duration: 0.5 }),
      2: hasProperties({ type: 'A', offset: 0.75, duration: 0.25 })
    }))
  })
})
