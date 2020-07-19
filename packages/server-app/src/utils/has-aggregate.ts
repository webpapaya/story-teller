import { hasProperty, Matcher } from 'hamjest'

export const hasAggregate = (matcher: Matcher) => hasProperty('0', matcher)
