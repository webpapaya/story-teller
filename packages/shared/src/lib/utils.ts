export const randBetween = (lower: number, upper: number) =>
  Math.floor(Math.random() * (upper - lower)) + lower
