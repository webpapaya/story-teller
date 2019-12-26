import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
email=Email
`)

const de = new FluentResource(`
email=E-Mail
`)

export const useTranslations = buildI18n({ en, de })
