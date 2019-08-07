import { Stamp, Booking, Config } from '../domain'
import { calculateCorrelationDate } from './calculate-correlation-date'

export const stampsToBookings = (config: Config, stamps: Stamp[]) => {
  return stamps.reduce((result, currentStamp, index) => {
    const previousStamp = stamps[index - 1]
    if (!previousStamp || previousStamp.type === 'Stop') { return result }

    result.push({
      type: previousStamp.type === 'Start' ? 'Work' : 'Break',
      correlationDate: calculateCorrelationDate(config, stamps, index),
      from: previousStamp.timestamp,
      until: currentStamp.timestamp,
      origin: [previousStamp, currentStamp]
    })

    return result
  }, [] as Booking[])
}

export default stampsToBookings
