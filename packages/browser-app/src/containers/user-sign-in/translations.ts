import { FluentResource } from '@fluent/bundle'
import { buildI18n } from '../../utils/i18n'

const en = new FluentResource(`
userIdentifier=Email/Username
password=Password
requestPasswordReset=Password forgotten?
`)

const de = new FluentResource(`
userIdentifier=E-Mail/Benutzername
password=Passwort
requestPasswordReset=Passwort vergessen?
`)

export const useTranslations = buildI18n({ en, de })
