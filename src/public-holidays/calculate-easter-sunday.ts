// @ts-ignore
import { LocalDate } from 'js-joda'

// Credits to: https://gist.github.com/johndyer/0dffbdd98c2046f41180c051f378f343
export const calculateCatholicEasterSunday = (year: number) => {
  const f = Math.floor
  const G = year % 19
  const C = f(year / 100)
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11))
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7
  const L = I - J
  const month = 3 + f((L + 40) / 44)
  const day = L + 28 - 31 * f(month / 4)

  return LocalDate.of(year, month, day)
}

export const calculateOrthodoxEasterSunday = (year: number) => {
  const a = year % 19
  const b = year % 7
  const c = year % 4

  const d = (19 * a + 16) % 30
  const e = (2 * c + 4 * b + 6 * d) % 7
  const f = (19 * a + 16) % 30
  const key = f + e + 3

  const month = (key > 30) ? 5 : 4
  const day = (key > 30) ? key - 30 : key

  return LocalDate.of(year, month, day)
}
