import { hasProperty, Matcher } from 'hamjest'

export const hasAggregate = (matcher: Matcher) => hasProperty('0', matcher)
export const hasEvents = (matcher: Matcher) => hasProperty('1', matcher)
