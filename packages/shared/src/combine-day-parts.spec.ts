// @ts-ignore
import { assertThat, hasProperties, hasProperty } from 'hamjest'
import { combineDayParts } from './combine-day-parts'
import { dayPartFactory } from './factories'

describe('combineDayParts', () => {
  it('single full day is returned as is', () => {
    assertThat(combineDayParts([dayPartFactory.build()]),
      hasProperty('length', 1))
  })

  it('two full days, returns 1 day part', () => {
    assertThat(combineDayParts([
      dayPartFactory.build({ }),
      dayPartFactory.build({ })
    ]), hasProperty('length', 1))
  })

  it('half day (prio 0) and full day (prio 1), returns 2 day parts', () => {
    assertThat(combineDayParts([
      dayPartFactory.build({ priority: 0 }),
      dayPartFactory.build({ priority: 1, duration: 0.5 })
    ]), hasProperty('length', 2))
  })

  it('half day (prio 1) and full day (prio 0), returns 1 day part', () => {
    assertThat(combineDayParts([
      dayPartFactory.build({ priority: 1 }),
      dayPartFactory.build({ priority: 0, duration: 0.5 })
    ]), hasProperty('length', 1))
  })

  it('full day (prio 0) and half day (prio 1) at the end, returns 2 day parts', () => {
    assertThat(combineDayParts([
      dayPartFactory.build({ priority: 1, offset: 0.5, duration: 0.5, type: 'B' }),
      dayPartFactory.build({ priority: 0, offset: 0, type: 'A' })
    ]), hasProperties({
      length: 2,
      0: hasProperties({ type: 'A', offset: 0, duration: 0.5 }),
      1: hasProperties({ type: 'B', offset: 0.5, duration: 0.5 })
    }))
  })

  it('first quarter (prio 0) and last quarter (prio 0) of day, returns 2 day parts', () => {
    assertThat(combineDayParts([
      dayPartFactory.build({ priority: 0, offset: 0, duration: 0.25, type: 'A' }),
      dayPartFactory.build({ priority: 0, offset: 0.75, duration: 0.25, type: 'B' })
    ]), hasProperties({
      length: 2,
      0: hasProperties({ type: 'A', offset: 0, duration: 0.25 }),
      1: hasProperties({ type: 'B', offset: 0.75, duration: 0.25 })
    }))
  })

  it('full day (prio 0) and half day (prio 1) in the middle, returns 3 day parts', () => {
    assertThat(combineDayParts([
      dayPartFactory.build({ priority: 1, offset: 0.25, duration: 0.5, type: 'B' }),
      dayPartFactory.build({ priority: 0, type: 'A' })
    ]), hasProperties({
      length: 3,
      0: hasProperties({ type: 'A', offset: 0, duration: 0.25 }),
      1: hasProperties({ type: 'B', offset: 0.25, duration: 0.5 }),
      2: hasProperties({ type: 'A', offset: 0.75, duration: 0.25 })
    }))
  })
})
