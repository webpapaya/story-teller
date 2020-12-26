import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
`)

const de = new FluentResource(`
`)

export const useTranslations = buildI18n({ en, de })
