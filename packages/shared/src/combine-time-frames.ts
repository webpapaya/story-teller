type DayPartSettings<T> = {
  getOffset: (object: T) => number
  setOffset: (object: T, value: number) => T

  getDuration: (object: T) => number
  setDuration: (object: T, value: number) => T

  orderFn: (a: T, b: T) => number
}

export const combineTimeFrames = <T>(c: DayPartSettings<T>) => (timeFrames: T[]) => {
  const frames = [...timeFrames].sort(c.orderFn)
  const result: T[] = []

  let currentFrame: T | undefined
  while (currentFrame = frames.shift()) { // eslint-disable-line no-cond-assign
    const previousFrame = result[result.length - 1]
    const needsToBeReplaced = previousFrame && c.getOffset(currentFrame) === c.getOffset(previousFrame)

    if (!previousFrame) {
      result.push(currentFrame)
      continue
    } else if (needsToBeReplaced) {
      result[result.length - 1] = currentFrame
    } else if (c.getDuration(currentFrame) > 0) {
      result.push(currentFrame)
    }

    const currentFrameEnd = c.getOffset(currentFrame) + c.getDuration(currentFrame)
    const previousFrameEnd = c.getOffset(previousFrame) + c.getDuration(previousFrame)
    const nextDuration = previousFrameEnd - currentFrameEnd

    if (previousFrameEnd > c.getOffset(currentFrame)) {
      const updatedDuration = c.getOffset(currentFrame) - c.getOffset(previousFrame)
      c.setDuration(previousFrame, updatedDuration)
    }

    if (previousFrameEnd > currentFrameEnd) {
      const nextDayPart = { ...previousFrame }
      c.setOffset(nextDayPart, currentFrameEnd)
      c.setDuration(nextDayPart, nextDuration)

      frames.push(nextDayPart)
      frames.sort(c.orderFn)
    }
  }

  return result
}
