import { Stamp, Booking, Config } from './domain'
import { Duration } from 'js-joda'

const areStampsClose = (threshold: Duration, previousStamp: Stamp, currentStamp: Stamp) => {
  const timePrevious = previousStamp.timestamp
  // @ts-ignore
  const timeCurrent = currentStamp.timestamp.minus(threshold)

  return timeCurrent.isBefore(timePrevious) ||
    timePrevious.equals(timeCurrent)
}

const combineWhenClose = (threshold: Duration, stamps: Stamp[], index: number) => {
  for (let i = index; i >= 0; i--) {
    const currentStamp = stamps[i]
    const previousStamp = stamps[i - 1]

    if (!previousStamp || previousStamp.type !== 'Stop') { continue }
    if (areStampsClose(threshold, previousStamp, currentStamp)) { continue }

    return currentStamp.timestamp.toLocalDate()
  }
  return stamps[0].timestamp.toLocalDate()
}

const calculateCorrelationDate = (config: Config, stamps: Stamp[], index: number) => {
  if (config.correlationDate.kind === 'combineIntersection') {
    return combineWhenClose(Duration.ZERO, stamps, index)
  } else {
    return combineWhenClose(config.correlationDate.threshold, stamps, index)
  }
}

export const stampsToBookings = (config: Config, stamps: Stamp[]) => {
  return stamps.reduce((result, currentStamp, index) => {
    const previousStamp = stamps[index - 1]

    if (previousStamp && previousStamp.type === 'Start') {
      result.push({
        type: 'Work',
        correlationDate: calculateCorrelationDate(config, stamps, index),
        from: previousStamp.timestamp,
        until: currentStamp.timestamp,
        origin: [previousStamp, currentStamp]
      })
    } else if (previousStamp && previousStamp.type === 'Break') {
      result.push({
        type: 'Break',
        correlationDate: calculateCorrelationDate(config, stamps, index),
        from: previousStamp.timestamp,
        until: currentStamp.timestamp,
        origin: [previousStamp, currentStamp]
      })
    }

    return result
  }, [] as Booking[])
}

export default stampsToBookings
