import qs from 'qs'

export const readFromLocation = (property: string, defaultValue: string) => {
  const parsed = qs.parse(global.location.search.replace(/^\?/, ''))
  return parsed[property] as string ?? defaultValue
}
