// @ts-ignore
import { assertThat, hasProperties, hasProperty } from 'hamjest'
import * as Factory from 'factory.ts'
import { Day } from './domain'

const sortDayPoints = (dayPoints: Day[]) => {
  return dayPoints.sort((a, b) => {
    return b.offset - a.offset || b.priority - a.priority
  })
}

const calculateDayKind = (days: Day[]) => {
  const dayPoints = [...days]
  const result: Day[] = []

  let currentDayPoint: Day | undefined
  while (currentDayPoint = dayPoints.pop()) { // eslint-disable-line no-cond-assign
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

    if (previousDayEnd > currentDayEnd || currentDay.offset === previousDay.offset) {
      dayPoints.push({
        ...previousDay,
        offset: currentDayEnd,
        duration: nextDuration
      })
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
  it('with one day given returns one day', () => {
    assertThat(calculateDayKind([dayFactory.build()]),
      hasProperty('length', 1))
  })

  it('full day, different priority', () => {
    assertThat(calculateDayKind([
      dayFactory.build({ priority: 0 }),
      dayFactory.build({ priority: 2 })
    ]), hasProperty('length', 1))
  })

  it('full day, different wtf', () => {
    assertThat(calculateDayKind([
      dayFactory.build({ priority: 0 }),
      dayFactory.build({ priority: 2, duration: 0.5 })
    ]), hasProperty('length', 2))
  })

  it('with one full day and one half day', () => {
    assertThat(calculateDayKind([
      dayFactory.build({ priority: 2, offset: 0.5, duration: 0.5, type: 'second' }),
      dayFactory.build({ priority: 0, type: 'first' })
    ]), hasProperties({
      0: hasProperties({ type: 'first', offset: 0, duration: 0.5 }),
      1: hasProperties({ type: 'second', offset: 0.5, duration: 0.5 })
    }))
  })

  it('with one full day and half day in middle', () => {
    assertThat(calculateDayKind([
      dayFactory.build({ priority: 2, offset: 0.25, duration: 0.5, type: 'second' }),
      dayFactory.build({ priority: 0, type: 'first' })
    ]), hasProperties({
      0: hasProperties({ type: 'first', offset: 0, duration: 0.25 }),
      1: hasProperties({ type: 'second', offset: 0.25, duration: 0.5 }),
      2: hasProperties({ type: 'first', offset: 0.75, duration: 0.25 })
    }))
  })
})
