import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
name = Name
submit = Create new project
`)

const de = new FluentResource(`
name = Name
submit = Neues Projekt erstellen
`)

export const useTranslations = buildI18n({ en, de })
