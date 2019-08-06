import { Stamp, Booking } from './domain'

export const stampsToBookings = (stamps: Stamp[]) => {
  return stamps.reduce((result, currentStamp, index) => {
    const previousStamp = stamps[index - 1]

    if (previousStamp && previousStamp.type === 'Start') {
      result.push({
        type: 'Work',
        from: previousStamp.timestamp,
        until: currentStamp.timestamp,
        origin: [previousStamp, currentStamp]
      })
    } else if (previousStamp && previousStamp.type === 'Break') {
      result.push({
        type: 'Break',
        from: previousStamp.timestamp,
        until: currentStamp.timestamp,
        origin: [previousStamp, currentStamp]
      })
    }

    return result
  }, [] as Booking[])
}

export default stampsToBookings
