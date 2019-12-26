
import qs from 'qs'
import { History } from 'history'

export const readQSFromLocation = <T>(history: History, key: string, defaultValue: T) => {
  const queryString = history.location.search.replace(/^\?/, '')
  return qs.parse(queryString)[key] || defaultValue
}

export const writeQSToLocation = <T>(history: History, key: string, value: T) => {
  const queryString = history.location.search.replace(/^\?/, '')
  history.push({
    search: qs.stringify({
      ...qs.parse(queryString),
      [key]: value
    }, { arrayFormat: 'indices', encode: false })
  })
}
