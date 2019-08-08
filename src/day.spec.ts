// @ts-ignore
import { assertThat, hasProperties, hasProperty } from 'hamjest'
import * as Factory from 'factory.ts'
import { Day } from './domain'

type DayPoint = {
  value: number
  day: Day
}

const sortDayPoints = (dayPoints: DayPoint[]) => {
  return dayPoints.sort((a, b) => {
    return b.value - a.value || b.day.priority - a.day.priority
  })
}

const calculateDayKind = (days: Day[]) => {
  const dayPoints = sortDayPoints(days.reduce((result, day) => {
    result.push({ value: day.offset, day })
    return result
  }, [] as DayPoint[]))

  const result: Day[] = []

  let currentDayPoint: DayPoint | undefined
  while (currentDayPoint = dayPoints.pop()) { // eslint-disable-line no-cond-assign
    const currentDay = currentDayPoint.day
    const previousDay = result[result.length - 1]
    result.push(currentDayPoint.day)
    if (!previousDay) { continue }

    const currentDayEnd = currentDay.offset + currentDay.duration
    const previousDayEnd = previousDay.offset + previousDay.duration
    previousDay.duration = currentDayPoint.day.offset - previousDay.offset
    if (previousDayEnd > currentDayEnd) {
      dayPoints.push({
        value: previousDayEnd,
        day: {
          ...previousDay,
          offset: currentDayEnd,
          duration: previousDayEnd - currentDayEnd
        }
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
