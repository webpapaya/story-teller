import { Stamp, Booking, Config, CorrelationDatePosition } from './domain'
import { Duration } from 'js-joda'

const areStampsClose = (threshold: Duration, previousStamp: Stamp, currentStamp: Stamp) => {
  const timePrevious = previousStamp.timestamp
  // @ts-ignore
  const timeCurrent = currentStamp.timestamp.minus(threshold)

  return timeCurrent.isBefore(timePrevious) ||
    timePrevious.equals(timeCurrent)
}

const combineWhenClose = (options: { threshold: Duration, position: CorrelationDatePosition }, stamps: Stamp[], index: number) => {
  const stampChain = []

  for (let i = index; i >= 0; i--) {
    const currentStamp = stamps[i]
    const previousStamp = stamps[i - 1]
    stampChain.unshift(currentStamp)
    if (previousStamp && previousStamp.type === 'Stop' && !areStampsClose(options.threshold, previousStamp, currentStamp)) { break }
  }

  const firstTimestamp = stampChain[0].timestamp
  const lastTimestamp = stampChain[stampChain.length - 1].timestamp
  if (options.position === 'center') {
    const duration = Duration.between(firstTimestamp, lastTimestamp)
    // @ts-ignore
    return firstTimestamp.plus(duration).toLocalDate()
  } else if (options.position === 'end') {
    return lastTimestamp.toLocalDate()
  } else {
    return firstTimestamp.toLocalDate()
  }
}

const calculateCorrelationDate = (config: Config, stamps: Stamp[], index: number) => {
  if (config.correlationDateStrategy.kind === 'combineIntersection') {
    return combineWhenClose({
      threshold: Duration.ZERO,
      position: config.correlationDatePosition
    }, stamps, index)
  } else {
    return combineWhenClose({
      threshold: config.correlationDateStrategy.threshold,
      position: config.correlationDatePosition
    }, stamps, index)
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
