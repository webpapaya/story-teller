import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
password=New Password
submit=Reset password
cancel=Cancel
`)

const de = new FluentResource(`
password=Neues Passwort
submit=Passwort zurücksetzen
cancel=Abbrechen
`)

export const useTranslations = buildI18n({ en, de })
