import { Stamp, CorrelationDateConfig as Config } from '../domain'
import { Duration, ChronoUnit, LocalTime, LocalDateTime } from 'js-joda'

const areStampsClose = (threshold: Duration, previousStamp: Stamp, currentStamp: Stamp) => {
  const timePrevious = previousStamp.timestamp
  // @ts-ignore
  const timeCurrent = currentStamp.timestamp.minus(threshold)

  return timeCurrent.isBefore(timePrevious) ||
    timePrevious.equals(timeCurrent)
}

const buildStampChain = (config: Config, stamps: Stamp[], index: number) => {
  const stampChain = []
  for (let i = index; i >= 0; i--) {
    const currentStamp = stamps[i]
    const previousStamp = stamps[i - 1]
    stampChain.unshift(currentStamp)
    if (previousStamp && previousStamp.type === 'Stop' && !areStampsClose(config.threshold, previousStamp, currentStamp)) { break }
  }
  return stampChain
}

const applyDatePosition = (config: Config, stampChain: Stamp[]) => {
  const firstTimestamp = stampChain[0].timestamp
  const lastTimestamp = stampChain[stampChain.length - 1].timestamp
  if (config.position === 'center') {
    const duration = Duration.between(firstTimestamp, lastTimestamp)
    // @ts-ignore
    return firstTimestamp.plus(duration)
  } else if (config.position === 'end') {
    return lastTimestamp
  } else {
    return firstTimestamp
  }
}

const applyTimeshift = (config: Config, correlationTimestamp: LocalDateTime) => {
  const offset = LocalTime.MIDNIGHT
    .until(config.startOfDay, ChronoUnit.MICROS)

  return correlationTimestamp.minus(offset, ChronoUnit.MICROS).toLocalDate()
}

export const calculateCorrelationDate = (config: Config, stamps: Stamp[], index: number) => {
  const stampChain = buildStampChain(config, stamps, index)
  const timestamp = applyDatePosition(config, stampChain)
  return applyTimeshift(config, timestamp)
}
