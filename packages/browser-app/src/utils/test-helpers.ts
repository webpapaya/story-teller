// @ts-ignore
import { hasProperty } from 'hamjest'

export const lastCallArgs = (matcher: any) =>
  hasProperty('lastCall', hasProperty('args', matcher))

export const lastCallNthArg = (number: number, matcher: any) =>
  lastCallArgs(hasProperty(`${number}`, matcher))
