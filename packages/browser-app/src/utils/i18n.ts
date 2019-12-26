import { FluentResource, FluentBundle } from '@fluent/bundle'
import { negotiateLanguages } from '@fluent/langneg'
import * as common from './i18n.common'

export const buildI18n = (translations: {
  de: FluentResource
  en: FluentResource
}) => {
  const [locale] = negotiateLanguages(
    navigator.languages,
    Object.keys(translations),
    { defaultLocale: 'en' }
  )

  const bundle = new FluentBundle(locale)
  const addResource = (t: typeof translations) => {
    // @ts-ignore
    const resource: FluentResource = t[locale]
    const errors = bundle.addResource(resource)
    errors.forEach((error) => console.warn(error))
  }

  addResource(common)
  addResource(translations)

  return () => ({
    t: (id: string, args?: object | undefined) => {
      const message = bundle.getMessage(id)
      if (message && message.value) {
        return bundle.formatPattern(message.value, args)
      } else {
        const errorMessage = `TODO: translations missing for: "${id}"`
        console.warn(errorMessage)
        return errorMessage
      }
    }
  })
}
