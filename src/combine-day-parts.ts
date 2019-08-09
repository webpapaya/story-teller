import { DayPart } from './domain'
import { combineTimeFrames } from './combine-time-frames'

export const combineDayParts = combineTimeFrames<DayPart>({
  getOffset: (dayPart) => dayPart.offset,
  setOffset: (dayPart, value) => {
    dayPart.offset = value
    return dayPart
  },

  getDuration: (dayPart) => dayPart.duration,
  setDuration: (dayPart, value) => {
    dayPart.duration = value
    return dayPart
  },

  orderFn: (a, b) => a.offset - b.offset || a.priority - b.priority
})
